import {
  AtletismoExercise, AtletismoExerciseType, AtletismoFase, AtletismoFaseCuerpo,
  AtletismoFaseEnfriamiento, AtletismoFaseEntradaCalor, AtletismoRitmos, DiaSemana,
} from '../data/atletismoTypes';
import { parseDuration } from './atletismoPace';
import { diaSemanaFromISO } from './atletismoDate';

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

export function estimarDistanciaCuerpoKm(cuerpo: AtletismoFaseCuerpo, ritmos: AtletismoRitmos): number {
  if (cuerpo.distanciaKm !== undefined) return cuerpo.distanciaKm;
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
    reps: cuerpo.series ?? 0,
    distSerieM: cuerpo.distanciaSerieM ?? 0,
    descansoSeg: cuerpo.descansoSeg ?? 0,
    totalKm: tipo === 'tirada_larga_especifica' ? (cuerpo.distanciaKm ?? 0) : 0,
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
