export function isRealDate(iso: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function dateFromIso(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function shiftMonths(iso: string, months: number): string {
  const date = dateFromIso(iso);
  date.setUTCMonth(date.getUTCMonth() + months);
  return isoDate(date);
}

export function previousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}
