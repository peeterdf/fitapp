import { AtletismoExercise, AtletismoRitmos } from '../data/atletismoTypes';
import { parseDuration } from './atletismoPace';
import { encodeWorkoutFit, FitWorkoutStep, FIT_DURATION_TYPE, FIT_TARGET_TYPE, FIT_INTENSITY } from './fitEncoder';

const PACE_TOLERANCE_SEG = 8; // +/- seg/km alrededor del ritmo objetivo

function speedRangeFromPace(paceSegPorKm: number, toleranciaSeg = PACE_TOLERANCE_SEG): { low: number; high: number } {
  const lentoSeg = paceSegPorKm + toleranciaSeg;
  const rapidoSeg = Math.max(1, paceSegPorKm - toleranciaSeg);
  return {
    low: Math.round((1000 / lentoSeg) * 1000),
    high: Math.round((1000 / rapidoSeg) * 1000),
  };
}

function pasoContinuo(nombre: string, km: number, paceStr: string, intensity: FitWorkoutStep['intensity']): FitWorkoutStep {
  const { low, high } = speedRangeFromPace(parseDuration(paceStr));
  return {
    name: nombre,
    durationType: FIT_DURATION_TYPE.distance,
    durationValue: Math.round(km * 100000), // km -> cm
    targetType: FIT_TARGET_TYPE.speed,
    customSpeedLow: low,
    customSpeedHigh: high,
    intensity,
  };
}

function pasoAbierto(nombre: string, minutos: number, intensity: FitWorkoutStep['intensity']): FitWorkoutStep {
  return {
    name: nombre,
    durationType: FIT_DURATION_TYPE.time,
    durationValue: Math.round(minutos * 60 * 1000),
    targetType: FIT_TARGET_TYPE.open,
    intensity,
  };
}

function pasoRepechoDistancia(nombre: string, metros: number, intensity: FitWorkoutStep['intensity']): FitWorkoutStep {
  return {
    name: nombre,
    durationType: FIT_DURATION_TYPE.distance,
    durationValue: Math.round(metros * 100), // m -> cm
    targetType: FIT_TARGET_TYPE.open,
    intensity,
  };
}

function pasoRepetir(veces: number): FitWorkoutStep {
  return {
    name: `Repetir x${veces}`,
    durationType: FIT_DURATION_TYPE.repeatUntilStepsCmplt,
    durationValue: veces,
    targetType: FIT_TARGET_TYPE.open,
    targetValue: 0, // se resuelve al índice real del bloque en generarFitDeSesion
    intensity: FIT_INTENSITY.active,
  };
}

function pasosCuerpo(sesion: AtletismoExercise, ritmos: AtletismoRitmos): FitWorkoutStep[] {
  const c = sesion.cuerpo;
  switch (sesion.tipo) {
    case 'fondo':
      return [pasoContinuo('Fondo', c.distanciaKm ?? 0, ritmos.fondo, FIT_INTENSITY.active)];
    case 'tempo':
      return [pasoContinuo('Tempo', c.distanciaKm ?? 0, ritmos.tempo, FIT_INTENSITY.active)];
    case 'fartlek':
      return [pasoAbierto('Fartlek libre', c.tiempoMin ?? 0, FIT_INTENSITY.active)];
    case 'series':
      return [
        pasoContinuo(`${c.distanciaSerieM ?? 0} m fuerte`, (c.distanciaSerieM ?? 0) / 1000, ritmos.series, FIT_INTENSITY.active),
        pasoAbierto('Trote de recuperación', (c.descansoSeg ?? 0) / 60, FIT_INTENSITY.rest),
        pasoRepetir(c.series ?? 1),
      ];
    case 'cuestas':
      return [
        pasoRepechoDistancia(`${c.distanciaSerieM ?? 0} m repecho`, c.distanciaSerieM ?? 0, FIT_INTENSITY.active),
        pasoAbierto('Bajada / recuperación', (c.descansoSeg ?? 0) / 60, FIT_INTENSITY.rest),
        pasoRepetir(c.series ?? 1),
      ];
    case 'tirada_larga_especifica': {
      const total = c.distanciaKm ?? 0;
      const especifico = Math.min(c.tramosRitmoObjetivoKm ?? 0, total);
      if (especifico > 0 && especifico < total) {
        return [
          pasoContinuo('Fondo suave', total - especifico, ritmos.fondo, FIT_INTENSITY.active),
          pasoContinuo('Tramo a ritmo objetivo', especifico, ritmos.ritmoObjetivoCarrera, FIT_INTENSITY.active),
        ];
      }
      return [pasoContinuo('Fondo largo', total, ritmos.fondo, FIT_INTENSITY.active)];
    }
    default:
      return [];
  }
}

export function generarFitDeSesion(sesion: AtletismoExercise, ritmos: AtletismoRitmos): Uint8Array {
  const pasos: FitWorkoutStep[] = [
    pasoAbierto('Entrada en calor', sesion.entrada_en_calor.tiempoMin, FIT_INTENSITY.warmup),
    ...pasosCuerpo(sesion, ritmos),
    pasoAbierto('Enfriamiento', sesion.enfriamiento.tiempoMin, FIT_INTENSITY.cooldown),
  ];

  // El paso "Repetir" (series/cuestas) siempre va 2 posiciones después del
  // paso de trabajo que repite (trabajo, descanso, repetir) — resolvemos acá
  // su índice real dentro del array final, que incluye la entrada en calor.
  const idxRepetir = pasos.findIndex(p => p.durationType === FIT_DURATION_TYPE.repeatUntilStepsCmplt);
  if (idxRepetir !== -1) {
    pasos[idxRepetir] = { ...pasos[idxRepetir], targetValue: idxRepetir - 2 };
  }

  return encodeWorkoutFit(`${sesion.nombre} - ${sesion.fecha}`, pasos);
}
