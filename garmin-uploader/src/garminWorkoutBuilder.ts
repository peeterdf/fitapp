import { AtletismoExercise, AtletismoFaseCuerpo, AtletismoRitmos, AtletismoTramo } from './atletismoExportTypes';
import { paceRangeSeconds, paceSecPerKmToMs } from './pace';

// ─── SCHEMA DEL WORKOUT DE GARMIN (workout-service) ──────────────────────
// Confirmado cruzando 3 fuentes reales (no de memoria):
//  - Pythe1337N/garmin-connect (RunningTemplate.ts): forma base de
//    ExecutableStepDTO, distancia en metros, "no.target".
//  - mkuthan/garmin-workouts (Python, con tests/CI activo): RepeatGroupDTO
//    con numberOfIterations, y los ids de conditionType (lap/time/distance).
//  - ThomasRondof/GarminWorkoutAItoJSON: el mapa completo de stepTypeId
//    (warmup/cooldown/interval/recovery/rest/repeat/main) y el target
//    "pace.zone" (id 6) con la fórmula de conversión min/km -> m/s.

const STEP_TYPE = {
  warmup: { stepTypeId: 1, stepTypeKey: 'warmup' },
  cooldown: { stepTypeId: 2, stepTypeKey: 'cooldown' },
  interval: { stepTypeId: 3, stepTypeKey: 'interval' },
  recovery: { stepTypeId: 4, stepTypeKey: 'recovery' },
  rest: { stepTypeId: 5, stepTypeKey: 'rest' },
  repeat: { stepTypeId: 6, stepTypeKey: 'repeat' },
} as const;

const CONDITION_TYPE = {
  time: { conditionTypeId: 2, conditionTypeKey: 'time' },
  distance: { conditionTypeId: 3, conditionTypeKey: 'distance' },
} as const;

const TARGET_NONE = { workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target' };
const TARGET_PACE = { workoutTargetTypeId: 6, workoutTargetTypeKey: 'pace.zone' };

const PACE_TOLERANCE_SEG = 8; // +/- seg/km alrededor del ritmo objetivo

interface GarminStep {
  type: 'ExecutableStepDTO' | 'RepeatGroupDTO';
  stepOrder: number;
  stepType: { stepTypeId: number; stepTypeKey: string };
  childStepId: number | null;
  description?: string | null;
  endCondition?: { conditionTypeId: number; conditionTypeKey: string };
  endConditionValue?: number | null;
  preferredEndConditionUnit?: { unitId: number; unitKey: string; factor: number } | null;
  targetType?: { workoutTargetTypeId: number; workoutTargetTypeKey: string };
  targetValueOne?: number | null;
  targetValueTwo?: number | null;
  numberOfIterations?: number;
  workoutSteps?: GarminStep[];
  smartRepeat?: boolean;
}

let orderCounter = 1;
function nextOrder(): number {
  return orderCounter++;
}

function stepTime(stepType: typeof STEP_TYPE[keyof typeof STEP_TYPE], seconds: number): GarminStep {
  return {
    type: 'ExecutableStepDTO',
    stepOrder: nextOrder(),
    stepType,
    childStepId: null,
    description: null,
    endCondition: CONDITION_TYPE.time,
    endConditionValue: Math.round(seconds),
    preferredEndConditionUnit: null,
    targetType: TARGET_NONE,
    targetValueOne: null,
    targetValueTwo: null,
  };
}

function stepDistanceNoTarget(stepType: typeof STEP_TYPE[keyof typeof STEP_TYPE], meters: number): GarminStep {
  return {
    type: 'ExecutableStepDTO',
    stepOrder: nextOrder(),
    stepType,
    childStepId: null,
    description: null,
    endCondition: CONDITION_TYPE.distance,
    endConditionValue: Math.round(meters),
    preferredEndConditionUnit: { unitId: 1, unitKey: 'meter', factor: 100 },
    targetType: TARGET_NONE,
    targetValueOne: null,
    targetValueTwo: null,
  };
}

function stepDistancePace(km: number, paceStr: string): GarminStep {
  const { lowSec, highSec } = paceRangeSeconds(paceStr, PACE_TOLERANCE_SEG);
  const low = paceSecPerKmToMs(lowSec); // más lento -> velocidad más baja
  const high = paceSecPerKmToMs(highSec); // más rápido -> velocidad más alta
  return {
    type: 'ExecutableStepDTO',
    stepOrder: nextOrder(),
    stepType: STEP_TYPE.interval,
    childStepId: null,
    description: null,
    endCondition: CONDITION_TYPE.distance,
    endConditionValue: Math.round(km * 1000),
    preferredEndConditionUnit: { unitId: 1, unitKey: 'meter', factor: 100 },
    targetType: TARGET_PACE,
    targetValueOne: low,
    targetValueTwo: high,
  };
}

function stepRepeat(iterations: number, buildInner: () => GarminStep[]): GarminStep {
  const outerOrder = nextOrder();
  const savedCounter = orderCounter;
  orderCounter = 1; // los pasos anidados numeran su propio orden desde 1
  const inner = buildInner();
  orderCounter = savedCounter;
  return {
    type: 'RepeatGroupDTO',
    stepOrder: outerOrder,
    stepType: STEP_TYPE.repeat,
    childStepId: null,
    numberOfIterations: iterations,
    workoutSteps: inner,
    smartRepeat: false,
  };
}

/** Un tramo de una sesión con estructura de bloques (piramide, series_variadas,
 * o un progresivo/lo que sea editado a mano) — tolera "distanciaKm" o
 * "distanciaM" y trata `reps` ausente/1 como un tramo único, sin repetición. */
function pasoTramo(t: AtletismoTramo, ritmos: AtletismoRitmos): GarminStep[] {
  const km = t.distanciaKm ?? (t.distanciaM ?? 0) / 1000;
  const pace = t.ritmoObjetivo ?? ritmos.fondo;
  const reps = t.reps && t.reps > 1 ? Math.round(t.reps) : 1;
  if (reps > 1) {
    return [
      stepRepeat(reps, () => {
        const inner = [stepDistancePace(km, pace)];
        if (t.descansoSeg) inner.push(stepTime(STEP_TYPE.recovery, t.descansoSeg));
        return inner;
      }),
    ];
  }
  return [stepDistancePace(km, pace)];
}

function pasosCuerpo(sesion: AtletismoExercise, ritmos: AtletismoRitmos): GarminStep[] {
  const c: AtletismoFaseCuerpo = sesion.cuerpo;

  // Sesiones con estructura de tramos (piramide, series_variadas, o cualquier
  // sesión editada a mano que use esta forma) — se arman a partir de `tramos`
  // sin importar el `tipo`, así no dependemos de que coincida exactamente con
  // lo que arma un builder de fitapp.
  if (Array.isArray(c.tramos) && c.tramos.length > 0) {
    return c.tramos.flatMap(t => pasoTramo(t, ritmos));
  }

  switch (sesion.tipo) {
    case 'fondo':
      return [stepDistancePace(c.distanciaKm ?? 0, ritmos.fondo)];
    case 'tempo':
      return [stepDistancePace(c.distanciaKm ?? 0, ritmos.tempo)];
    case 'progresivo': {
      // Sin tramos explícitos: partir la distancia en un primer tramo suave y
      // un tramo final acelerando hasta el ritmo de cierre.
      const total = c.distanciaKm ?? 0;
      const mitad = total / 2;
      return [
        stepDistancePace(mitad, c.ritmoObjetivo ?? ritmos.fondo),
        stepDistancePace(total - mitad, c.ritmoFinal ?? ritmos.tempo),
      ];
    }
    case 'fartlek':
      return [stepTime(STEP_TYPE.interval, (c.tiempoMin ?? 0) * 60)];
    case 'series':
    case 'cruise_intervals':
      return [
        stepRepeat(c.series ?? 1, () => [
          stepDistancePace((c.distanciaSerieM ?? 0) / 1000, c.ritmoObjetivo ?? ritmos.series),
          stepTime(STEP_TYPE.recovery, c.descansoSeg ?? 0),
        ]),
      ];
    case 'strides':
      return [
        stepRepeat(c.series ?? 1, () => [
          stepDistanceNoTarget(STEP_TYPE.interval, c.distanciaSerieM ?? 0),
          stepTime(STEP_TYPE.recovery, c.descansoSeg ?? 0),
        ]),
      ];
    case 'cuestas':
      return [
        stepRepeat(c.series ?? 1, () => [
          stepDistanceNoTarget(STEP_TYPE.interval, c.distanciaSerieM ?? 0),
          stepTime(STEP_TYPE.rest, c.descansoSeg ?? 0),
        ]),
      ];
    case 'tirada_larga_especifica': {
      const total = c.distanciaKm ?? 0;
      const especifico = Math.min(c.tramosRitmoObjetivoKm ?? 0, total);
      if (especifico > 0 && especifico < total) {
        return [
          stepDistancePace(total - especifico, ritmos.fondo),
          stepDistancePace(especifico, ritmos.ritmoObjetivoCarrera),
        ];
      }
      return [stepDistancePace(total, ritmos.fondo)];
    }
    case 'piramide':
    case 'series_variadas':
      // Debería venir siempre con `tramos` (manejado arriba); si no, fondo de relleno.
      return c.distanciaKm ? [stepDistancePace(c.distanciaKm, ritmos.fondo)] : [];
  }
  return [];
}

const SPORT_TYPE = { sportTypeId: 1, sportTypeKey: 'running' };

// ─── Validación contra lo que Garmin realmente acepta ────────────────────
// Los ids/keys de STEP_TYPE/CONDITION_TYPE/TARGET_*/SPORT_TYPE de arriba ya
// están cruzados contra 3 fuentes reales (ver comentario al principio del
// archivo), pero eso no evita que un bug futuro en pasosCuerpo arme un paso
// con un id que no está en esa lista, o un target de ritmo con NaN. Sin esta
// validación, eso se descubre recién como un 400 críptico de la API de
// Garmin (o algo que el reloj no sabe interpretar); con ella, falla acá con
// un mensaje claro antes de siquiera intentar subirlo.
const STEP_TYPE_IDS_VALIDOS = new Set<number>(Object.values(STEP_TYPE).map(t => t.stepTypeId));
const CONDITION_TYPE_IDS_VALIDOS = new Set<number>(Object.values(CONDITION_TYPE).map(t => t.conditionTypeId));
const TARGET_TYPE_IDS_VALIDOS = new Set<number>([TARGET_NONE.workoutTargetTypeId, TARGET_PACE.workoutTargetTypeId]);

function validarPaso(paso: GarminStep, ruta: string): void {
  if (!STEP_TYPE_IDS_VALIDOS.has(paso.stepType.stepTypeId)) {
    throw new Error(`Workout inválido en ${ruta}: stepTypeId ${paso.stepType.stepTypeId} no es uno de los que acepta Garmin (${[...STEP_TYPE_IDS_VALIDOS].join(', ')}).`);
  }

  if (paso.type === 'RepeatGroupDTO') {
    if (!paso.numberOfIterations || paso.numberOfIterations < 1) {
      throw new Error(`Workout inválido en ${ruta}: un grupo de repetición necesita numberOfIterations >= 1 (fue ${paso.numberOfIterations}).`);
    }
    (paso.workoutSteps ?? []).forEach((hijo, i) => validarPaso(hijo, `${ruta} > repetición, paso ${i + 1}`));
    return;
  }

  if (!paso.endCondition || !CONDITION_TYPE_IDS_VALIDOS.has(paso.endCondition.conditionTypeId)) {
    throw new Error(`Workout inválido en ${ruta}: endCondition ${paso.endCondition?.conditionTypeId} no es uno de los que acepta Garmin (${[...CONDITION_TYPE_IDS_VALIDOS].join(', ')}).`);
  }
  if (!Number.isFinite(paso.endConditionValue) || (paso.endConditionValue as number) <= 0) {
    throw new Error(`Workout inválido en ${ruta}: endConditionValue debe ser un número > 0 (fue ${paso.endConditionValue}) — revisá la distancia/duración de esta sesión.`);
  }

  if (!paso.targetType || !TARGET_TYPE_IDS_VALIDOS.has(paso.targetType.workoutTargetTypeId)) {
    throw new Error(`Workout inválido en ${ruta}: targetType ${paso.targetType?.workoutTargetTypeId} no es uno de los que acepta Garmin (${[...TARGET_TYPE_IDS_VALIDOS].join(', ')}).`);
  }
  if (paso.targetType.workoutTargetTypeId === TARGET_PACE.workoutTargetTypeId) {
    if (!Number.isFinite(paso.targetValueOne) || !Number.isFinite(paso.targetValueTwo)
      || (paso.targetValueOne as number) <= 0 || (paso.targetValueTwo as number) <= 0) {
      throw new Error(`Workout inválido en ${ruta}: target de ritmo con valores no numéricos (${paso.targetValueOne}, ${paso.targetValueTwo}) — revisá el formato del ritmo objetivo de esta sesión (ej. "5:30/km").`);
    }
  }
}

/** Recorre el workout armado y confirma que solo usa códigos que Garmin acepta, antes de subirlo. */
export function validarWorkoutGarmin(workout: { sportType: { sportTypeId: number }; workoutSegments: { workoutSteps: GarminStep[] }[] }): void {
  if (workout.sportType.sportTypeId !== SPORT_TYPE.sportTypeId) {
    throw new Error(`Workout inválido: sportTypeId ${workout.sportType.sportTypeId} no es uno de los soportados (${SPORT_TYPE.sportTypeId}).`);
  }
  workout.workoutSegments.forEach((seg, si) => {
    seg.workoutSteps.forEach((paso, pi) => validarPaso(paso, `segmento ${si + 1}, paso ${pi + 1}`));
  });
}

export function construirWorkoutGarmin(sesion: AtletismoExercise, ritmos: AtletismoRitmos) {
  orderCounter = 1;
  const steps: GarminStep[] = [
    stepTime(STEP_TYPE.warmup, sesion.entrada_en_calor.tiempoMin * 60),
    ...pasosCuerpo(sesion, ritmos),
    stepTime(STEP_TYPE.cooldown, sesion.enfriamiento.tiempoMin * 60),
  ];

  const workout = {
    workoutId: undefined,
    ownerId: undefined,
    workoutName: `${sesion.nombre} - ${sesion.fecha}`,
    description: `Generado por fitapp — ${sesion.tipo}`,
    sportType: SPORT_TYPE,
    workoutSegments: [
      {
        segmentOrder: 1,
        sportType: SPORT_TYPE,
        workoutSteps: steps,
      },
    ],
  };

  validarWorkoutGarmin(workout);
  return workout;
}
