import { AtletismoExercise, AtletismoRitmos } from './atletismoExportTypes';
import { parsePaceToSeconds, paceSecPerKmToMs } from './pace';

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
  const paceSec = parsePaceToSeconds(paceStr);
  const low = paceSecPerKmToMs(paceSec + PACE_TOLERANCE_SEG); // más lento -> velocidad más baja
  const high = paceSecPerKmToMs(Math.max(1, paceSec - PACE_TOLERANCE_SEG)); // más rápido -> velocidad más alta
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

function pasosCuerpo(sesion: AtletismoExercise, ritmos: AtletismoRitmos): GarminStep[] {
  const c = sesion.cuerpo;
  switch (sesion.tipo) {
    case 'fondo':
      return [stepDistancePace(c.distanciaKm ?? 0, ritmos.fondo)];
    case 'tempo':
      return [stepDistancePace(c.distanciaKm ?? 0, ritmos.tempo)];
    case 'fartlek':
      return [stepTime(STEP_TYPE.interval, (c.tiempoMin ?? 0) * 60)];
    case 'series':
      return [
        stepRepeat(c.series ?? 1, () => [
          stepDistancePace((c.distanciaSerieM ?? 0) / 1000, ritmos.series),
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
  }
}

const SPORT_TYPE = { sportTypeId: 1, sportTypeKey: 'running' };

export function construirWorkoutGarmin(sesion: AtletismoExercise, ritmos: AtletismoRitmos) {
  orderCounter = 1;
  const steps: GarminStep[] = [
    stepTime(STEP_TYPE.warmup, sesion.entrada_en_calor.tiempoMin * 60),
    ...pasosCuerpo(sesion, ritmos),
    stepTime(STEP_TYPE.cooldown, sesion.enfriamiento.tiempoMin * 60),
  ];

  return {
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
}
