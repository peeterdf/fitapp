// ─── ATLETISMO: TYPES ────────────────────────────────────────────────────
// Sección de running: planes generados automáticamente a partir de
// parámetros configurables por el usuario al crear el plan.

export type AtletismoExerciseType =
  | 'fondo'
  | 'series'
  | 'fartlek'
  | 'tempo'
  | 'cuestas'
  | 'tirada_larga_especifica'
  | 'progresivo'
  | 'piramide'
  | 'series_variadas'
  | 'cruise_intervals'
  | 'strides';

// 'acumulacion'/'transformacion' desdoblan 'especifico' en planes de 9+ semanas
// (ver calcularFases) — 'especifico' se sigue usando tal cual en planes de 4-8
// semanas, donde no hay margen para separar ambos focos.
export type AtletismoFase = 'base' | 'acumulacion' | 'transformacion' | 'especifico' | 'tapering';

export interface AtletismoFaseEntradaCalor {
  distanciaKm: number;
  tiempoMin: number;
  desc: string;
}

export interface AtletismoFaseEnfriamiento {
  distanciaKm: number;
  tiempoMin: number;
  desc: string;
}

// Un tramo dentro de una sesión con estructura de múltiples bloques distintos
// (piramide: cada tramo con reps=1; series_variadas: cada tramo agrupa varias
// repeticiones de la misma distancia).
export interface AtletismoTramo {
  reps: number;
  distanciaM: number;
  ritmoObjetivo: string;
  descansoSeg?: number;
  descansoTipo?: 'trote suave' | 'caminata' | 'parado';
}

// Cuerpo (main) — no todos los campos aplican a todos los tipos.
export interface AtletismoFaseCuerpo {
  distanciaKm?: number;          // fondo, tempo, tirada_larga_especifica, progresivo, piramide
  ritmoObjetivo?: string;        // pace de referencia para esta sesión, ej. "5:20/km"
  ritmoFinal?: string;           // progresivo: ritmo al que se llega al final de la sesión
  series?: number;               // series, cuestas, cruise_intervals, strides
  distanciaSerieM?: number;      // distancia de cada repetición (m)
  descansoSeg?: number;          // descanso entre repeticiones (s)
  descansoTipo?: 'trote suave' | 'caminata' | 'parado';
  pendiente?: string;            // cuestas: descripción de la pendiente
  tiempoMin?: number;            // fartlek: duración total libre
  tramosRitmoObjetivoKm?: number; // tirada_larga_especifica: km finales a ritmo objetivo de carrera
  tramos?: AtletismoTramo[];     // piramide, series_variadas: bloques con ritmo/pausa propios
  desc: string;
}

export interface AtletismoExercise {
  id: number;
  tipo: AtletismoExerciseType;
  nombre: string;
  semana: number;   // número de semana del plan (1-indexed)
  dia: DiaSemana;
  fecha: string;     // ISO date (YYYY-MM-DD)
  fase: AtletismoFase;
  entrada_en_calor: AtletismoFaseEntradaCalor;
  cuerpo: AtletismoFaseCuerpo;
  enfriamiento: AtletismoFaseEnfriamiento;
  distanciaTotalKm: number; // estimación de km totales de la sesión (calor + cuerpo + enfriamiento)
}

export type ObjetivoCarrera = '10k' | '21k';

export type DiaSemana = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb' | 'Dom';

export interface AtletismoPlanInputs {
  objetivo_principal: ObjetivoCarrera;
  fecha_objetivo: string; // ISO date
  objetivo_secundario?: ObjetivoCarrera;
  tiempo_actual_10k: string; // "HH:MM:SS" o "MM:SS"
  dias_disponibles_por_semana: number;
  dias_preferidos?: DiaSemana[];
}

export interface AtletismoRitmos {
  vdot: number;
  fondo: string;              // min:seg / km
  tempo: string;
  series: string;
  ritmoObjetivoCarrera: string;
}

export interface AtletismoSemana {
  numero: number;
  fechaInicio: string;
  fechaFin: string;
  fase: AtletismoFase;
  sesiones: AtletismoExercise[];
  kilometrajeTotalKm: number;
}

export interface AtletismoPlan {
  id: number;
  createdAt: string;
  inputs: AtletismoPlanInputs;
  ritmos: AtletismoRitmos;
  semanas: AtletismoSemana[];
}
