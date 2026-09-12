// Espejo mínimo de los tipos de fitapp (src/data/atletismoTypes.ts) —
// esta app es un proyecto separado, no comparte código con fitapp, así que
// solo declara la forma de los datos que realmente necesita leer del JSON
// pegado desde el portapapeles.

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

// Única fuente de verdad de los tipos válidos en esta app — si fitapp agrega
// un tipo nuevo y no se refleja acá, queremos un error claro al pegar el
// JSON, no un crash más adelante armando el workout de Garmin.
export const TIPOS_VALIDOS: readonly AtletismoExerciseType[] = [
  'fondo', 'series', 'fartlek', 'tempo', 'cuestas', 'tirada_larga_especifica',
  'progresivo', 'piramide', 'series_variadas', 'cruise_intervals', 'strides',
];

export function esTipoValido(tipo: unknown): tipo is AtletismoExerciseType {
  return typeof tipo === 'string' && (TIPOS_VALIDOS as readonly string[]).includes(tipo);
}

// Bloque dentro de una sesión con estructura de tramos (piramide, series_variadas,
// o un progresivo editado a mano). `reps` y las unidades de distancia son
// opcionales y se toleran en más de una forma porque sesiones editadas a mano
// no siempre siguen exactamente el shape que arma fitapp.
export interface AtletismoTramo {
  reps?: number;
  distanciaM?: number;
  distanciaKm?: number;
  ritmoObjetivo?: string;
  descansoSeg?: number;
}

export interface AtletismoFaseCuerpo {
  distanciaKm?: number;
  ritmoObjetivo?: string;
  ritmoFinal?: string;
  series?: number;
  distanciaSerieM?: number;
  descansoSeg?: number;
  tiempoMin?: number;
  tramosRitmoObjetivoKm?: number;
  tramos?: AtletismoTramo[];
}

export interface AtletismoExercise {
  id: number;
  tipo: AtletismoExerciseType;
  nombre: string;
  fecha: string; // ISO date YYYY-MM-DD
  entrada_en_calor: { tiempoMin: number };
  cuerpo: AtletismoFaseCuerpo;
  enfriamiento: { tiempoMin: number };
}

export interface AtletismoRitmos {
  fondo: string; // "M:SS" por km
  tempo: string;
  series: string;
  ritmoObjetivoCarrera: string;
}

export interface AtletismoSessionExport {
  version: 1;
  session: AtletismoExercise;
  ritmos: AtletismoRitmos;
}

export function parseSessionExport(json: string): AtletismoSessionExport {
  const data = JSON.parse(json);
  if (data?.version !== 1 || !data.session || !data.ritmos) {
    throw new Error('JSON inválido: no parece un export de sesión de fitapp.');
  }
  const tipo = data.session?.tipo;
  if (!esTipoValido(tipo)) {
    throw new Error(`Tipo de sesión desconocido: "${tipo}". Tipos válidos: ${TIPOS_VALIDOS.join(', ')}.`);
  }
  return data as AtletismoSessionExport;
}
