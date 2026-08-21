// ─── ATLETISMO: TYPES ────────────────────────────────────────────────────
// Sección de running: planes generados automáticamente a partir de
// parámetros configurables por el usuario al crear el plan.

export type AtletismoExerciseType =
  | 'fondo'
  | 'series'
  | 'fartlek'
  | 'tempo'
  | 'cuestas'
  | 'tirada_larga_especifica';

export type AtletismoFase = 'base' | 'especifico' | 'tapering';

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

// Cuerpo (main) — no todos los campos aplican a todos los tipos.
export interface AtletismoFaseCuerpo {
  distanciaKm?: number;          // fondo, tempo, tirada_larga_especifica
  ritmoObjetivo?: string;        // pace de referencia para esta sesión, ej. "5:20/km"
  series?: number;               // series, cuestas
  distanciaSerieM?: number;      // distancia de cada repetición (m)
  descansoSeg?: number;          // descanso entre repeticiones (s)
  descansoTipo?: 'trote suave' | 'caminata' | 'parado';
  pendiente?: string;            // cuestas: descripción de la pendiente
  tiempoMin?: number;            // fartlek: duración total libre
  tramosRitmoObjetivoKm?: number; // tirada_larga_especifica: km finales a ritmo objetivo de carrera
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
