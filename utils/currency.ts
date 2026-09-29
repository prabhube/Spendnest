const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const INR_WITH_PAISE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number, withPaise = false): string {
  const formatter = withPaise ? INR_WITH_PAISE : INR;
  return formatter.format(amount);
}

export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}
