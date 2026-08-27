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
  | 'tirada_larga_especifica';

export interface AtletismoFaseCuerpo {
  distanciaKm?: number;
  series?: number;
  distanciaSerieM?: number;
  descansoSeg?: number;
  tiempoMin?: number;
  tramosRitmoObjetivoKm?: number;
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
  return data as AtletismoSessionExport;
}
