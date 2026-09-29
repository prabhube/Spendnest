import { expensesToCsv } from '@/utils/csv';
import type { ExpenseWithDetails } from '@/types/expense';

function expense(partial: Partial<ExpenseWithDetails> & Pick<ExpenseWithDetails, 'id'>): ExpenseWithDetails {
  return {
    user_id: 'user-1',
    category_id: 'cat-1',
    amount: 850,
    description: 'Rice + vegetables',
    expense_date: '2026-09-28',
    payment_method: 'UPI',
    family_member_id: null,
    created_at: '2026-09-28T10:00:00.000Z',
    category: {
      id: 'cat-1',
      user_id: 'user-1',
      name: 'Groceries',
      icon: '🛒',
      type: 'expense',
      is_default: true,
    },
    family_member: null,
    ...partial,
  };
}

describe('expensesToCsv', () => {
  it('includes a header and a data row', () => {
    const csv = expensesToCsv([expense({ id: '1' })]);
    expect(csv).toContain('Date,Category,Description,Amount,Payment,Family Member');
    expect(csv).toContain('2026-09-28,Groceries,Rice + vegetables,850,UPI,');
  });

  it('escapes commas and quotes in descriptions', () => {
    const csv = expensesToCsv([
      expense({ id: '1', description: 'Rice, "basmati", oil' }),
    ]);
    expect(csv).toContain('"Rice, ""basmati"", oil"');
  });
});
