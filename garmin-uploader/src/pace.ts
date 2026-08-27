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
