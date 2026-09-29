const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export type YearMonth = {
  year: number;
  month: number;
};

export function nowYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthLabel({ year, month }: YearMonth): string {
  return `${MONTHS[month - 1]} ${year}`;
}

export function shiftMonth(current: YearMonth, delta: number): YearMonth {
  const date = new Date(current.year, current.month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(value: string): string {
  const date = parseISODate(value);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function dateGroupLabel(isoDate: string, today = todayISO()): string {
  const todayDate = parseISODate(today);
  const yesterday = new Date(todayDate);
  yesterday.setDate(todayDate.getDate() - 1);
  const yesterdayISO = toISODate(yesterday);

  if (isoDate === today) return 'Today';
  if (isoDate === yesterdayISO) return 'Yesterday';
  return formatDisplayDate(isoDate);
}

export function inYearMonth(isoDate: string, ym: YearMonth): boolean {
  const date = parseISODate(isoDate);
  return date.getFullYear() === ym.year && date.getMonth() + 1 === ym.month;
}

export function dueDateForMonth(dueDay: number, ym: YearMonth): string {
  const lastDay = new Date(ym.year, ym.month, 0).getDate();
  const day = Math.min(dueDay, lastDay);
  return toISODate(new Date(ym.year, ym.month - 1, day));
}

export function daysUntil(isoDate: string, from = todayISO()): number {
  const start = parseISODate(from).getTime();
  const end = parseISODate(isoDate).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}
