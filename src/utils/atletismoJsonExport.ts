import { AtletismoExercise, AtletismoRitmos } from '../data/atletismoTypes';

// Formato de intercambio con la app separada "garmin-uploader" — no es el
// binario .FIT, es la data plana de la sesión + los ritmos del plan
// (necesarios para calcular los target de ritmo al armar el JSON de Garmin).
export interface AtletismoSessionExport {
  version: 1;
  session: AtletismoExercise;
  ritmos: AtletismoRitmos;
}

export function construirExportJSON(sesion: AtletismoExercise, ritmos: AtletismoRitmos): string {
  const payload: AtletismoSessionExport = { version: 1, session: sesion, ritmos };
  return JSON.stringify(payload, null, 2);
}
