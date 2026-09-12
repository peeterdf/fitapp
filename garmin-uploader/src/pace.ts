/** Parsea "M:SS" (ritmo por km) a segundos totales. */
export function parsePaceToSeconds(pace: string): number {
  const parts = pace.trim().split(':').map(Number);
  if (parts.some(p => !Number.isFinite(p) || p < 0)) return NaN;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  throw new Error(`Ritmo inválido: "${pace}"`);
}

/** Convierte un ritmo (seg/km) a velocidad en m/s, como espera el target de Garmin. */
export function paceSecPerKmToMs(paceSecPerKm: number): number {
  return 1000 / paceSecPerKm;
}

/**
 * Extrae el rango lento/rápido (seg/km) de un ritmo de sesión. A diferencia de
 * `ritmos.*` (siempre "M:SS" plano), `cuerpo.ritmoObjetivo` puede venir con
 * sufijo "/km" y como rango ("4:35-4:45/km") en sesiones editadas a mano.
 */
export function paceRangeSeconds(raw: string, toleranceSec = 8): { lowSec: number; highSec: number } {
  const clean = raw.trim().replace(/\/?\s*km$/i, '').trim();
  const partes = clean.split('-').map(s => s.trim()).filter(Boolean);
  if (partes.length === 2) {
    const a = parsePaceToSeconds(partes[0]);
    const b = parsePaceToSeconds(partes[1]);
    return { lowSec: Math.max(a, b), highSec: Math.max(1, Math.min(a, b)) };
  }
  const paceSec = parsePaceToSeconds(clean);
  return { lowSec: paceSec + toleranceSec, highSec: Math.max(1, paceSec - toleranceSec) };
}
