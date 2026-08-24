import { DiaSemana } from '../data/atletismoTypes';

export const DIAS_ORDEN: DiaSemana[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 0 = Lun ... 6 = Dom, alineado con DIAS_ORDEN (JS getDay() usa 0 = Dom)
export function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function fechaParaDia(inicioSemana: Date, dia: DiaSemana): Date {
  const objetivoIdx = DIAS_ORDEN.indexOf(dia);
  const inicioIdx = weekdayIndex(inicioSemana);
  const diff = (objetivoIdx - inicioIdx + 7) % 7;
  return addDays(inicioSemana, diff);
}

export function diaSemanaFromISO(iso: string): DiaSemana {
  return DIAS_ORDEN[weekdayIndex(parseISODateLocal(iso))];
}

export function todayISO(): string {
  return toISODate(startOfDay(new Date()));
}
