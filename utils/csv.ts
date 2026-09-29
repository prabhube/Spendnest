import type { ExpenseWithDetails } from '@/types/expense';

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function expensesToCsv(expenses: ExpenseWithDetails[]): string {
  const header = ['Date', 'Category', 'Description', 'Amount', 'Payment', 'Family Member'];
  const rows = expenses.map((expense) => [
    expense.expense_date,
    expense.category?.name ?? '',
    expense.description ?? '',
    String(expense.amount),
    expense.payment_method ?? '',
    expense.family_member?.name ?? '',
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
}
