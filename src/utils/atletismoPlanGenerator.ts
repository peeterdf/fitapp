import {
  AtletismoExercise, AtletismoExerciseType, AtletismoFase, AtletismoFaseCuerpo,
  AtletismoFaseEnfriamiento, AtletismoFaseEntradaCalor, AtletismoPlan, AtletismoPlanInputs,
  AtletismoRitmos, AtletismoSemana, DiaSemana, ObjetivoCarrera,
} from '../data/atletismoTypes';
import { calcularRitmos, parseDuration } from './atletismoPace';

// ─── ATLETISMO: GENERADOR DE PLAN ────────────────────────────────────────
// A partir de los inputs del formulario arma semanas desde hoy hasta la
// fecha objetivo, distribuidas en fase base / específica / tapering, y
// completa cada sesión con sus 3 fases (calor, cuerpo, enfriamiento).

const DIAS_ORDEN: DiaSemana[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const DIAS_POR_DEFECTO: Record<number, DiaSemana[]> = {
  1: ['Sáb'],
  2: ['Mar', 'Sáb'],
  3: ['Lun', 'Mié', 'Vie'],
  4: ['Lun', 'Mar', 'Jue', 'Sáb'],
  5: ['Lun', 'Mar', 'Mié', 'Vie', 'Sáb'],
  6: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  7: DIAS_ORDEN,
};

const NOMBRES_TIPO: Record<AtletismoExerciseType, string> = {
  fondo: 'Fondo',
  series: 'Series',
  fartlek: 'Fartlek',
  tempo: 'Tempo run',
  cuestas: 'Cuestas',
  tirada_larga_especifica: 'Tirada larga específica',
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

function elegirDias(n: number, preferidos?: DiaSemana[]): DiaSemana[] {
  const cantidad = Math.min(7, Math.max(1, Math.round(n)));
  if (!preferidos || preferidos.length === 0) {
    return DIAS_POR_DEFECTO[cantidad] ?? DIAS_ORDEN.slice(0, cantidad);
  }
  const set = new Set(preferidos);
  if (set.size >= cantidad) {
    return DIAS_ORDEN.filter(d => set.has(d)).slice(0, cantidad);
  }
  for (const d of DIAS_POR_DEFECTO[cantidad] ?? DIAS_ORDEN) {
    if (set.size >= cantidad) break;
    set.add(d);
  }
  return DIAS_ORDEN.filter(d => set.has(d));
}

function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 0 = Lun ... 6 = Dom, alineado con DIAS_ORDEN (JS getDay() usa 0 = Dom)
function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function fechaParaDia(inicioSemana: Date, dia: DiaSemana): Date {
  const objetivoIdx = DIAS_ORDEN.indexOf(dia);
  const inicioIdx = weekdayIndex(inicioSemana);
  const diff = (objetivoIdx - inicioIdx + 7) % 7;
  return addDays(inicioSemana, diff);
}

function calcularFases(totalSemanas: number): AtletismoFase[] {
  const taperSemanas = totalSemanas <= 2 ? Math.min(1, totalSemanas) : totalSemanas <= 6 ? 1 : 2;
  let baseSemanas = totalSemanas <= taperSemanas ? 0 : Math.max(1, Math.round((totalSemanas - taperSemanas) * 0.4));
  let especificoSemanas = totalSemanas - taperSemanas - baseSemanas;
  if (especificoSemanas < 0) {
    baseSemanas = Math.max(0, baseSemanas + especificoSemanas);
    especificoSemanas = 0;
  }
  const fases: AtletismoFase[] = [
    ...Array(baseSemanas).fill('base' as const),
    ...Array(especificoSemanas).fill('especifico' as const),
    ...Array(taperSemanas).fill('tapering' as const),
  ];
  while (fases.length < totalSemanas) fases.push('tapering');
  while (fases.length > totalSemanas) fases.pop();
  return fases;
}

// ─── Fases de cada sesión (calor / enfriamiento) ─────────────────────────

function entradaEnCalor(): AtletismoFaseEntradaCalor {
  return { distanciaKm: 2, tiempoMin: 12, desc: 'Trote suave + movilidad articular + 3-4 progresiones cortas.' };
}
function enfriamiento(): AtletismoFaseEnfriamiento {
  return { distanciaKm: 1.2, tiempoMin: 8, desc: 'Trote muy suave + elongación general.' };
}

// ─── Cuerpo de cada tipo de sesión ────────────────────────────────────────

function cuerpoFondo(km: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  const d = Math.round(km * 10) / 10;
  return { distanciaKm: d, ritmoObjetivo: `${ritmos.fondo}/km`, desc: `Carrera continua a ritmo suave, ${d} km.` };
}

function cuerpoTempo(km: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  const d = Math.round(km * 10) / 10;
  return { distanciaKm: d, ritmoObjetivo: `${ritmos.tempo}/km`, desc: `Ritmo sostenido cercano al umbral (mejora 10k), ${d} km continuos.` };
}

function cuerpoSeries(reps: number, distM: number, descansoSeg: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
  return {
    series: reps, distanciaSerieM: distM, descansoSeg, descansoTipo: 'trote suave',
    ritmoObjetivo: `${ritmos.series}/km`,
    desc: `${reps} × ${distM} m a ritmo de series, con ${descansoSeg}s de trote suave de recuperación entre repeticiones.`,
  };
}

function cuerpoFartlek(tiempoMin: number): AtletismoFaseCuerpo {
  const t = Math.round(tiempoMin);
  return { tiempoMin: t, desc: `Fartlek libre de ${t} min: alternar tramos rápidos (1-3 min) con tramos suaves de recuperación según sensaciones.` };
}

function cuerpoCuestas(reps: number, distM: number, descansoSeg: number): AtletismoFaseCuerpo {
  return {
    series: reps, distanciaSerieM: distM, descansoSeg, descansoTipo: 'caminata', pendiente: 'moderada (5-8%)',
    desc: `${reps} repechos de ${distM} m en subida moderada a esfuerzo fuerte, bajada caminando/trotando muy suave como recuperación.`,
  };
}

function cuerpoTiradaLargaEspecifica(totalKm: number, kmRitmoObjetivo: number, ritmos: AtletismoRitmos): AtletismoFaseCuerpo {
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

// ─── Roles de sesión por semana ───────────────────────────────────────────

interface SesionPlanificada {
  dia: DiaSemana;
  tipo: AtletismoExerciseType;
  cuerpo: AtletismoFaseCuerpo;
}

function construirSesionesSemana(opts: {
  fase: AtletismoFase;
  objetivo: ObjetivoCarrera;
  dias: DiaSemana[];
  ritmos: AtletismoRitmos;
  progreso: number; // 0..1 dentro de la fase actual
}): SesionPlanificada[] {
  const { fase, objetivo, dias, ritmos, progreso } = opts;
  const n = dias.length;
  const resultado: SesionPlanificada[] = [];

  if (fase === 'base') {
    const kmFondo = lerp(5, 9, progreso);
    dias.forEach((dia, i) => {
      if (n >= 3 && i === Math.floor(n / 2)) {
        resultado.push({ dia, tipo: 'fartlek', cuerpo: cuerpoFartlek(lerp(20, 30, progreso)) });
      } else {
        const esLargo = i === n - 1 && n >= 2;
        resultado.push({ dia, tipo: 'fondo', cuerpo: cuerpoFondo(esLargo ? kmFondo * 1.3 : kmFondo, ritmos) });
      }
    });
    return resultado;
  }

  if (fase === 'especifico' && objetivo === '21k') {
    const kmLarga = lerp(12, 19, progreso);
    const kmEspecifico = lerp(2, 8, progreso);
    const kmTempo = lerp(5, 8, progreso);
    const kmFondo = lerp(7, 10, progreso);
    const repsCuestas = Math.round(lerp(6, 10, progreso));
    const idxLarga = n - 1; // la tirada larga va el último día disponible de la semana

    dias.forEach((dia, i) => {
      if (i === idxLarga) {
        resultado.push({ dia, tipo: 'tirada_larga_especifica', cuerpo: cuerpoTiradaLargaEspecifica(kmLarga, kmEspecifico, ritmos) });
      } else if (n >= 4 && i === 0) {
        resultado.push({ dia, tipo: 'tempo', cuerpo: cuerpoTempo(kmTempo, ritmos) });
      } else if (n >= 5 && i === 1) {
        resultado.push({ dia, tipo: 'cuestas', cuerpo: cuerpoCuestas(repsCuestas, 80, 90) });
      } else {
        resultado.push({ dia, tipo: 'fondo', cuerpo: cuerpoFondo(kmFondo, ritmos) });
      }
    });
    return resultado;
  }

  if (fase === 'especifico') {
    // objetivo 10k: priorizar series + tempo
    const repsSeries = Math.round(lerp(5, 8, progreso));
    const kmTempo = lerp(3, 6, progreso);
    const kmFondo = lerp(6, 9, progreso);
    const repsCuestas = Math.round(lerp(5, 8, progreso));

    dias.forEach((dia, i) => {
      if (i === 0) {
        resultado.push({ dia, tipo: 'series', cuerpo: cuerpoSeries(repsSeries, 1000, 120, ritmos) });
      } else if (n >= 2 && i === (n >= 4 ? 2 : 1)) {
        resultado.push({ dia, tipo: 'tempo', cuerpo: cuerpoTempo(kmTempo, ritmos) });
      } else if (n >= 5 && i === n - 2) {
        resultado.push({ dia, tipo: 'cuestas', cuerpo: cuerpoCuestas(repsCuestas, 100, 90) });
      } else {
        resultado.push({ dia, tipo: 'fondo', cuerpo: cuerpoFondo(kmFondo, ritmos) });
      }
    });
    return resultado;
  }

  // tapering — volumen decreciente, sin sorpresas antes de la carrera
  const kmFondo = lerp(6, 3, progreso);
  if (objetivo === '21k') {
    const kmLarga = lerp(12, 8, progreso);
    const kmEspecifico = lerp(3, 0, progreso);
    dias.forEach((dia, i) => {
      if (i === n - 1) {
        resultado.push({ dia, tipo: 'tirada_larga_especifica', cuerpo: cuerpoTiradaLargaEspecifica(kmLarga, kmEspecifico, ritmos) });
      } else if (i === 0 && n >= 3) {
        resultado.push({ dia, tipo: 'tempo', cuerpo: cuerpoTempo(lerp(4, 2, progreso), ritmos) });
      } else {
        resultado.push({ dia, tipo: 'fondo', cuerpo: cuerpoFondo(kmFondo, ritmos) });
      }
    });
    return resultado;
  }

  dias.forEach((dia, i) => {
    if (i === 0 && n >= 3) {
      resultado.push({ dia, tipo: 'series', cuerpo: cuerpoSeries(Math.max(3, Math.round(lerp(5, 3, progreso))), 1000, 120, ritmos) });
    } else {
      resultado.push({ dia, tipo: 'fondo', cuerpo: cuerpoFondo(kmFondo, ritmos) });
    }
  });
  return resultado;
}

function estimarDistanciaCuerpoKm(cuerpo: AtletismoFaseCuerpo, ritmos: AtletismoRitmos): number {
  if (cuerpo.distanciaKm !== undefined) return cuerpo.distanciaKm;
  if (cuerpo.series && cuerpo.distanciaSerieM) return (cuerpo.series * cuerpo.distanciaSerieM) / 1000;
  if (cuerpo.tiempoMin) {
    const segPorKm = (parseDuration(ritmos.fondo) + parseDuration(ritmos.tempo)) / 2;
    return (cuerpo.tiempoMin * 60) / segPorKm;
  }
  return 0;
}

// ─── Generador principal ──────────────────────────────────────────────────

export function generarPlan(inputs: AtletismoPlanInputs): AtletismoPlan {
  const ritmos = calcularRitmos(inputs.tiempo_actual_10k, inputs.objetivo_principal);

  const hoy = startOfDay(new Date());
  const fechaObjetivo = startOfDay(parseISODateLocal(inputs.fecha_objetivo));
  // Las semanas se alinean a Lun-Dom (semana calendario); las sesiones que
  // caerían antes de hoy dentro de la primera semana se filtran más abajo.
  const inicioLunes = addDays(hoy, -weekdayIndex(hoy));
  const diasHastaObjetivo = Math.max(1, Math.round((fechaObjetivo.getTime() - inicioLunes.getTime()) / 86400000));
  const totalSemanas = Math.max(1, Math.ceil(diasHastaObjetivo / 7));

  const fases = calcularFases(totalSemanas);
  const dias = elegirDias(inputs.dias_disponibles_por_semana, inputs.dias_preferidos);

  const rangoPorFase: Record<AtletismoFase, { inicio: number; fin: number }> = {
    base: { inicio: -1, fin: -1 },
    especifico: { inicio: -1, fin: -1 },
    tapering: { inicio: -1, fin: -1 },
  };
  fases.forEach((f, i) => {
    if (rangoPorFase[f].inicio === -1) rangoPorFase[f].inicio = i;
    rangoPorFase[f].fin = i;
  });

  let idSesion = 1;
  const semanas: AtletismoSemana[] = [];

  for (let semanaIdx = 0; semanaIdx < totalSemanas; semanaIdx++) {
    const fase = fases[semanaIdx];
    const rango = rangoPorFase[fase];
    const progreso = rango.fin === rango.inicio ? 1 : (semanaIdx - rango.inicio) / (rango.fin - rango.inicio);
    const inicioSemana = addDays(inicioLunes, semanaIdx * 7);

    const planificadas = construirSesionesSemana({ fase, objetivo: inputs.objetivo_principal, dias, ritmos, progreso });

    const sesiones: AtletismoExercise[] = [];
    for (const p of planificadas) {
      const fecha = fechaParaDia(inicioSemana, p.dia);
      if (fecha < hoy || fecha >= fechaObjetivo) continue; // no entrenar en el pasado ni el día de la carrera o después

      const ent = entradaEnCalor();
      const enf = enfriamiento();
      const cuerpoKm = estimarDistanciaCuerpoKm(p.cuerpo, ritmos);
      const distanciaTotalKm = Math.round((ent.distanciaKm + cuerpoKm + enf.distanciaKm) * 10) / 10;

      sesiones.push({
        id: idSesion++,
        tipo: p.tipo,
        nombre: NOMBRES_TIPO[p.tipo],
        semana: semanaIdx + 1,
        dia: p.dia,
        fecha: toISODate(fecha),
        fase,
        entrada_en_calor: ent,
        cuerpo: p.cuerpo,
        enfriamiento: enf,
        distanciaTotalKm,
      });
    }
    sesiones.sort((a, b) => a.fecha.localeCompare(b.fecha));

    semanas.push({
      numero: semanaIdx + 1,
      fechaInicio: toISODate(inicioSemana),
      fechaFin: toISODate(addDays(inicioSemana, 6)),
      fase,
      sesiones,
      kilometrajeTotalKm: Math.round(sesiones.reduce((acc, s) => acc + s.distanciaTotalKm, 0) * 10) / 10,
    });
  }

  return {
    id: Date.now(),
    createdAt: toISODate(hoy),
    inputs,
    ritmos,
    semanas,
  };
}
