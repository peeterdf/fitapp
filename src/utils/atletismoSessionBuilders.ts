import {
  AtletismoExercise, AtletismoExerciseType, AtletismoFase, AtletismoFaseCuerpo,
  AtletismoFaseEnfriamiento, AtletismoFaseEntradaCalor, AtletismoRitmos, AtletismoTramo, DiaSemana,
} from '../data/atletismoTypes';
import { formatPace, parseDuration } from './atletismoPace';
import { diaSemanaFromISO } from './atletismoDate';

function lerpNum(a: number, b: number, t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return a + (b - a) * clamped;
}

// ─── ATLETISMO: CONSTRUCTORES DE SESIÓN ──────────────────────────────────
// Compartidos entre el generador de plan y la edición manual de una sesión
// existente, para que ambos produzcan el mismo tipo de objeto (mismos
// textos de descripción, mismos campos derivados).

export const NOMBRES_TIPO: Record<AtletismoExerciseType, string> = {
  fondo: 'Fondo',
  series: 'Series',
  fartlek: 'Fartlek',
  tempo: 'Tempo run',
  cuestas: 'Cuestas',
  tirada_larga_especifica: 'Tirada larga específica',
  progresivo: 'Progresivo',
  piramide: 'Pirámide de ritmo',
  series_variadas: 'Series de distancias variadas',
  cruise_intervals: 'Series largas (cruise intervals)',
  strides: 'Rectas (strides)',
};

export function entradaEnCalor(distanciaKm = 2, tiempoMin = 12): AtletismoFaseEntradaCalor {
  return { distanciaKm, tiempoMin, desc: 'Trote suave + movilidad articular + 3-4 progresiones cortas.' };
}
export function enfriamiento(distanciaKm = 1.2, tiempoMin = 8): AtletismoFaseEnfriamiento {
  return { distanciaKm, tiempoMin, desc: 'Trote muy suave + elongación general.' };
}

export function cuerpoFondo(km: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  const d = Math.round(km * 10) / 10;
  return { distanciaKm: d, ritmoObjetivo: `${ritmos.fondo}/km`, desc: `Carrera continua a ritmo suave, ${d} km.` };
}

export function cuerpoTempo(km: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  const d = Math.round(km * 10) / 10;
  return { distanciaKm: d, ritmoObjetivo: `${ritmos.tempo}/km`, desc: `Ritmo sostenido cercano al umbral (mejora 10k), ${d} km continuos.` };
}

export function cuerpoSeries(reps: number, distM: number, descansoSeg: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  return {
    series: reps, distanciaSerieM: distM, descansoSeg, descansoTipo: 'trote suave',
    ritmoObjetivo: `${ritmos.series}/km`,
    desc: `${reps} × ${distM} m a ritmo de series, con ${descansoSeg}s de trote suave de recuperación entre repeticiones.`,
  };
}

export function cuerpoFartlek(tiempoMin: number): AtletismoFaseCuerpo {
  const t = Math.round(tiempoMin);
  return { tiempoMin: t, desc: `Fartlek libre de ${t} min: alternar tramos rápidos (1-3 min) con tramos suaves de recuperación según sensaciones.` };
}

export function cuerpoCuestas(reps: number, distM: number, descansoSeg: number): AtletismoFaseCuerpo {
  return {
    series: reps, distanciaSerieM: distM, descansoSeg, descansoTipo: 'caminata', pendiente: 'moderada (5-8%)',
    desc: `${reps} repechos de ${distM} m en subida moderada a esfuerzo fuerte, bajada caminando/trotando muy suave como recuperación.`,
  };
}

export function cuerpoTiradaLargaEspecifica(totalKm: number, kmRitmoObjetivo: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  const total = Math.round(totalKm * 10) / 10;
  const especifico = Math.round(Math.min(kmRitmoObjetivo, total) * 10) / 10;
  return {
    distanciaKm: total, tramosRitmoObjetivoKm: especifico,
    ritmoObjetivo: `${ritmos.ritmoObjetivoCarrera}/km en los tramos específicos`,
    desc: especifico > 0
      ? `Fondo largo de ${total} km a ritmo suave, con los últimos ${especifico} km a ritmo objetivo de carrera (${ritmos.ritmoObjetivoCarrera}/km).`
      : `Fondo largo de ${total} km a ritmo suave, sin tramos específicos esta semana.`,
  };
}

export function cuerpoProgresivo(km: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  const d = Math.round(km * 10) / 10;
  return {
    distanciaKm: d, ritmoObjetivo: `${ritmos.fondo}/km`, ritmoFinal: `${ritmos.tempo}/km`,
    desc: `Progresivo de ${d} km: arrancar a ritmo fácil (${ritmos.fondo}/km) y acelerar de forma gradual hasta cerrar cerca del ritmo de umbral (${ritmos.tempo}/km).`,
  };
}

/** Divide totalKm en `segmentos` tramos iguales, acelerando hacia el tramo central. */
export function cuerpoPiramide(totalKm: number, segmentos: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  const n = Math.max(3, Math.round(segmentos));
  const total = Math.round(totalKm * 10) / 10;
  const tramoKm = total / n;
  const tramoM = Math.round(tramoKm * 1000);
  const fondoSeg = parseDuration(ritmos.fondo);
  const seriesSeg = parseDuration(ritmos.series);
  const centro = (n - 1) / 2;
  const tramos: AtletismoTramo[] = Array.from({ length: n }, (_, i) => {
    const distanciaDelCentro = centro === 0 ? 0 : Math.abs(i - centro) / centro;
    const paceSeg = lerpNum(seriesSeg, fondoSeg, distanciaDelCentro);
    return { reps: 1, distanciaM: tramoM, ritmoObjetivo: `${formatPace(paceSeg)}/km` };
  });
  const centroIdx = Math.round(centro);
  return {
    distanciaKm: total, tramos,
    desc: `Pirámide de ritmo: ${total} km en ${n} tramos de ~${Math.round(tramoKm * 10) / 10} km, acelerando hacia el tramo central (${tramos[centroIdx].ritmoObjetivo}) y desacelerando después hasta volver a ritmo fondo.`,
  };
}

/** Combina tramos de distinta longitud en una sesión, más rápido cuanto más corto el tramo. */
export function cuerpoSeriesVariadas(grupos: { reps: number; distM: number; descansoSeg: number }[], ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  const seriesSeg = parseDuration(ritmos.series);
  const tramos: AtletismoTramo[] = grupos.map(g => ({
    reps: g.reps, distanciaM: g.distM, descansoSeg: g.descansoSeg, descansoTipo: 'trote suave',
    ritmoObjetivo: `${formatPace(seriesSeg * Math.pow(g.distM / 400, 0.06))}/km`,
  }));
  const resumen = tramos.map(t => `${t.reps}×${t.distanciaM}m`).join(' + ');
  return {
    tramos,
    desc: `Series de distancias variadas: ${resumen}, cada tramo a un ritmo más rápido cuanto más corta la distancia, con trote suave de recuperación entre repeticiones.`,
  };
}

/** Repeticiones largas (1000-2000m) a ritmo umbral con pausa corta (ratio ~5:1 esfuerzo:pausa). */
export function cuerpoCruiseIntervals(reps: number, distM: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  const tempoSegPorKm = parseDuration(ritmos.tempo);
  const trabajoSeg = (distM / 1000) * tempoSegPorKm;
  const descansoSeg = Math.max(30, Math.round(trabajoSeg / 5));
  return {
    series: reps, distanciaSerieM: distM, descansoSeg, descansoTipo: 'trote suave',
    ritmoObjetivo: `${ritmos.tempo}/km`,
    desc: `${reps} × ${distM} m a ritmo umbral, con ${descansoSeg}s de trote suave de recuperación (pausa corta, ~5:1 respecto al tiempo de esfuerzo).`,
  };
}

/** Aceleraciones cortas y controladas, bajo costo de fatiga — no cuentan como sesión de calidad. */
export function cuerpoStrides(reps: number, distM: number): AtletismoFaseCuerpo {
  const n = Math.round(reps);
  return {
    series: n, distanciaSerieM: distM, descansoSeg: 60, descansoTipo: 'trote suave',
    ritmoObjetivo: 'progresivo hasta rápido pero relajado, sin llegar a la fatiga',
    desc: `${n} × ${distM} m progresivos: acelerar de forma controlada hasta un ritmo rápido pero relajado, volviendo caminando/trotando suave. Bajo costo de fatiga — sirve para sumar al final de un fondo suave sin que cuente como sesión de calidad.`,
  };
}

export function estimarDistanciaCuerpoKm(cuerpo: AtletismoFaseCuerpo, ritmos: AtletismoRitmos): number {
  if (cuerpo.distanciaKm !== undefined) return cuerpo.distanciaKm;
  if (cuerpo.tramos && cuerpo.tramos.length > 0) {
    return cuerpo.tramos.reduce((acc, t) => acc + (t.reps * t.distanciaM) / 1000, 0);
  }
  if (cuerpo.series && cuerpo.distanciaSerieM) return (cuerpo.series * cuerpo.distanciaSerieM) / 1000;
  if (cuerpo.tiempoMin) {
    const segPorKm = (parseDuration(ritmos.fondo) + parseDuration(ritmos.tempo)) / 2;
    return (cuerpo.tiempoMin * 60) / segPorKm;
  }
  return 0;
}

// Parámetros editables por tipo — el subconjunto de campos que tiene
// sentido que el usuario ajuste manualmente para cada tipo de sesión.
export interface ParametrosCuerpo {
  km: number;               // fondo, tempo
  minutos: number;          // fartlek
  reps: number;              // series, cuestas
  distSerieM: number;       // series, cuestas
  descansoSeg: number;      // series, cuestas
  totalKm: number;          // tirada_larga_especifica
  kmRitmoObjetivo: number;  // tirada_larga_especifica
}

export function parametrosDesdeCuerpo(tipo: AtletismoExerciseType, cuerpo: AtletismoFaseCuerpo): ParametrosCuerpo {
  return {
    km: cuerpo.distanciaKm ?? 0,
    minutos: cuerpo.tiempoMin ?? 0,
    reps: cuerpo.series ?? cuerpo.tramos?.[0]?.reps ?? cuerpo.tramos?.length ?? 0,
    distSerieM: cuerpo.distanciaSerieM ?? cuerpo.tramos?.[0]?.distanciaM ?? 0,
    descansoSeg: cuerpo.descansoSeg ?? cuerpo.tramos?.[0]?.descansoSeg ?? 0,
    totalKm: (tipo === 'tirada_larga_especifica' || tipo === 'piramide') ? (cuerpo.distanciaKm ?? 0) : 0,
    kmRitmoObjetivo: cuerpo.tramosRitmoObjetivoKm ?? 0,
  };
}

export function construirCuerpo(tipo: AtletismoExerciseType, p: ParametrosCuerpo, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  switch (tipo) {
    case 'fondo': return cuerpoFondo(p.km, ritmos);
    case 'tempo': return cuerpoTempo(p.km, ritmos);
    case 'fartlek': return cuerpoFartlek(p.minutos);
    case 'series': return cuerpoSeries(p.reps, p.distSerieM, p.descansoSeg, ritmos);
    case 'cuestas': return cuerpoCuestas(p.reps, p.distSerieM, p.descansoSeg);
    case 'tirada_larga_especifica': return cuerpoTiradaLargaEspecifica(p.totalKm, p.kmRitmoObjetivo, ritmos);
    case 'progresivo': return cuerpoProgresivo(p.km, ritmos);
    case 'piramide': return cuerpoPiramide(p.totalKm, p.reps || 5, ritmos);
    case 'series_variadas': return cuerpoSeriesVariadas([{ reps: p.reps, distM: p.distSerieM, descansoSeg: p.descansoSeg }], ritmos);
    case 'cruise_intervals': return cuerpoCruiseIntervals(p.reps, p.distSerieM, ritmos);
    case 'strides': return cuerpoStrides(p.reps, p.distSerieM);
  }
}

/** Reconstruye una sesión completa a partir de sus parámetros editados a mano. */
export function reconstruirSesion(opts: {
  base: AtletismoExercise;
  fecha: string;
  params: ParametrosCuerpo;
  entradaKm: number;
  entradaMin: number;
  enfriamientoKm: number;
  enfriamientoMin: number;
  ritmos: AtletismoRitmos;
}): AtletismoExercise {
  const { base, fecha, params, entradaKm, entradaMin, enfriamientoKm, enfriamientoMin, ritmos } = opts;
  const ent = entradaEnCalor(entradaKm, entradaMin);
  const enf = enfriamiento(enfriamientoKm, enfriamientoMin);
  const cuerpo = construirCuerpo(base.tipo, params, ritmos);
  const cuerpoKm = estimarDistanciaCuerpoKm(cuerpo, ritmos);
  const dia: DiaSemana = diaSemanaFromISO(fecha);

  return {
    ...base,
    dia,
    fecha,
    entrada_en_calor: ent,
    cuerpo,
    enfriamiento: enf,
    distanciaTotalKm: Math.round((ent.distanciaKm + cuerpoKm + enf.distanciaKm) * 10) / 10,
  };
}

/** Crea una sesión nueva desde cero (agregar sesión manual a un plan/semana existente). */
export function crearSesion(opts: {
  id: number;
  tipo: AtletismoExerciseType;
  semana: number;
  fase: AtletismoFase;
  fecha: string;
  params: ParametrosCuerpo;
  entradaKm: number;
  entradaMin: number;
  enfriamientoKm: number;
  enfriamientoMin: number;
  ritmos: AtletismoRitmos;
}): AtletismoExercise {
  const { id, tipo, semana, fase, fecha, params, entradaKm, entradaMin, enfriamientoKm, enfriamientoMin, ritmos } = opts;
  const ent = entradaEnCalor(entradaKm, entradaMin);
  const enf = enfriamiento(enfriamientoKm, enfriamientoMin);
  const cuerpo = construirCuerpo(tipo, params, ritmos);
  const cuerpoKm = estimarDistanciaCuerpoKm(cuerpo, ritmos);
  const dia: DiaSemana = diaSemanaFromISO(fecha);

  return {
    id, tipo, nombre: NOMBRES_TIPO[tipo], semana, dia, fecha, fase,
    entrada_en_calor: ent,
    cuerpo,
    enfriamiento: enf,
    distanciaTotalKm: Math.round((ent.distanciaKm + cuerpoKm + enf.distanciaKm) * 10) / 10,
  };
}
