import { AtletismoPlan } from '../data/atletismoTypes';
import { nombrePlanPorDefecto } from './atletismoPlanGenerator';
import { NOMBRES_TIPO } from './atletismoSessionBuilders';

const TIPOS_VALIDOS = Object.keys(NOMBRES_TIPO);

// Formato de intercambio para hacer backup/compartir un plan completo entre
// dispositivos o con otra cuenta — no tiene relación con el JSON de sesión
// individual usado por "garmin-uploader" (ver atletismoJsonExport.ts).
export interface AtletismoPlanExport {
  version: 1;
  plan: AtletismoPlan;
}

export function construirExportPlanJSON(plan: AtletismoPlan): string {
  const payload: AtletismoPlanExport = { version: 1, plan };
  return JSON.stringify(payload, null, 2);
}

/** Valida y parsea un plan importado, asignándole un id nuevo para no pisar planes existentes. */
export function parseImportPlanJSON(raw: string): AtletismoPlan {
  const data = JSON.parse(raw);
  const plan: unknown = data && typeof data === 'object' && 'plan' in data ? (data as AtletismoPlanExport).plan : data;

  if (
    !plan || typeof plan !== 'object' ||
    !Array.isArray((plan as AtletismoPlan).semanas) ||
    !(plan as AtletismoPlan).ritmos ||
    !(plan as AtletismoPlan).inputs
  ) {
    throw new Error('El JSON no tiene el formato de un plan de atletismo.');
  }

  const p = plan as AtletismoPlan;
  for (const semana of p.semanas) {
    for (const sesion of semana.sesiones ?? []) {
      if (!TIPOS_VALIDOS.includes(sesion.tipo)) {
        throw new Error(
          `Tipo de sesión desconocido: "${sesion.tipo}" (semana ${semana.numero}, ${sesion.fecha}). Tipos válidos: ${TIPOS_VALIDOS.join(', ')}.`,
        );
      }
    }
  }

  return { ...p, id: Date.now(), nombre: p.nombre || nombrePlanPorDefecto(p.inputs) };
}
