import { AtletismoRitmos, ObjetivoCarrera } from '../data/atletismoTypes';

// ─── ATLETISMO: RITMOS DE ENTRENAMIENTO ──────────────────────────────────
// Fórmulas de Daniels-Gilbert (VDOT) para estimar el consumo de oxígeno a
// partir de una marca, y de Riegel (predicción de rendimiento equivalente)
// para proyectar el ritmo objetivo de una distancia distinta a la marca
// conocida. Son las fórmulas estándar usadas por la mayoría de calculadoras
// de ritmos de entrenamiento (Jack Daniels' Running Formula, McMillan, etc).

/** Parsea "HH:MM:SS" o "MM:SS" a segundos totales. */
export function parseDuration(text: string): number {
  const parts = text.trim().split(':').map(p => Number(p));
  if (parts.some(p => !Number.isFinite(p) || p < 0)) return NaN;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return NaN;
}

export function isValidDuration(text: string): boolean {
  const s = parseDuration(text);
  return Number.isFinite(s) && s > 0;
}

/** Formatea segundos por km como "M:SS". */
export function formatPace(segPerKm: number): string {
  const total = Math.round(segPerKm);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function vo2FromVelocity(vMinPorMin: number): number {
  return -4.6 + 0.182258 * vMinPorMin + 0.000104 * vMinPorMin * vMinPorMin;
}

function velocityFromVO2(vo2: number): number {
  const a = 0.000104, b = 0.182258, c = -(4.6 + vo2);
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}

function percentVO2Max(tiempoMin: number): number {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * tiempoMin) + 0.2989558 * Math.exp(-0.1932605 * tiempoMin);
}

/** VDOT (Daniels-Gilbert) a partir de una marca (distancia en m, tiempo en s). */
export function calcularVDOT(distanciaM: number, tiempoSeg: number): number {
  const tiempoMin = tiempoSeg / 60;
  const velocidad = distanciaM / tiempoMin; // m/min
  return vo2FromVelocity(velocidad) / percentVO2Max(tiempoMin);
}

/** Ritmo (seg/km) para un %VDOT dado. */
function paceSegPorKmDesdeVDOT(vdot: number, pct: number): number {
  const velocidad = velocityFromVO2(vdot * pct); // m/min
  return (1000 / velocidad) * 60;
}

/** Predicción de Riegel: tiempo equivalente en otra distancia a partir de una marca conocida. */
function riegelPrediccionSeg(distConocidaKm: number, distObjetivoKm: number, tiempoConocidoSeg: number): number {
  return tiempoConocidoSeg * Math.pow(distObjetivoKm / distConocidaKm, 1.06);
}

const DISTANCIA_KM: Record<ObjetivoCarrera, number> = { '10k': 10, '21k': 21.0975 };

/**
 * Calcula los ritmos de referencia del plan a partir del tiempo actual en
 * 10k y el objetivo principal.
 *  - fondo: ritmo suave / aeróbico (~70% VDOT)
 *  - tempo: ritmo sostenido cercano al umbral (~86% VDOT)
 *  - series: ritmo de repeticiones cortas (~98% VDOT)
 *  - ritmoObjetivoCarrera: ritmo de carrera proyectado para la distancia objetivo (Riegel)
 */
export function calcularRitmos(tiempoActual10kTexto: string, objetivo: ObjetivoCarrera): AtletismoRitmos {
  const tiempoSeg = parseDuration(tiempoActual10kTexto);
  const vdot = calcularVDOT(10000, tiempoSeg);

  const distObjetivoKm = DISTANCIA_KM[objetivo];
  const tiempoObjetivoSeg = riegelPrediccionSeg(10, distObjetivoKm, tiempoSeg);
  const ritmoObjetivoSegPorKm = tiempoObjetivoSeg / distObjetivoKm;

  return {
    vdot: Math.round(vdot * 10) / 10,
    fondo: formatPace(paceSegPorKmDesdeVDOT(vdot, 0.70)),
    tempo: formatPace(paceSegPorKmDesdeVDOT(vdot, 0.86)),
    series: formatPace(paceSegPorKmDesdeVDOT(vdot, 0.98)),
    ritmoObjetivoCarrera: formatPace(ritmoObjetivoSegPorKm),
  };
}
