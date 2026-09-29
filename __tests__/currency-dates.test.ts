import { formatCurrency, parseAmount } from '@/utils/currency';
import { dateGroupLabel, greetingForHour, monthLabel, shiftMonth } from '@/utils/dates';

describe('formatCurrency', () => {
  it('formats INR without paise by default', () => {
    expect(formatCurrency(48650).replace(/\s/g, '')).toMatch(/48,650/);
  });
});

describe('parseAmount', () => {
  it('parses a numeric string', () => {
    expect(parseAmount('850')).toBe(850);
  });

  it('strips currency junk', () => {
    expect(parseAmount('₹1,000')).toBe(1000);
  });

  it('returns 0 for empty input', () => {
    expect(parseAmount('')).toBe(0);
  });
});

describe('dates', () => {
  it('labels a month', () => {
    expect(monthLabel({ year: 2026, month: 9 })).toBe('September 2026');
  });

  it('shifts from December to January', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
  });

  it('returns time-of-day greetings', () => {
    expect(greetingForHour(8)).toBe('Good Morning');
    expect(greetingForHour(15)).toBe('Good Afternoon');
    expect(greetingForHour(20)).toBe('Good Evening');
  });

  it('groups today and yesterday', () => {
    expect(dateGroupLabel('2026-09-28', '2026-09-28')).toBe('Today');
    expect(dateGroupLabel('2026-09-27', '2026-09-28')).toBe('Yesterday');
  });
});
