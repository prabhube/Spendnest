import {
  buildMonthlyInsights,
  calculateCategoryPercentage,
  calculateMonthlyTotal,
  calculateRemainingBudget,
  calculateSavings,
  isBudgetReached,
  isBudgetWarning,
  spendingByCategory,
} from '@/utils/calculations';
import type { Category } from '@/types/category';
import type { ExpenseWithDetails } from '@/types/expense';

const groceries: Category = {
  id: 'cat-groc',
  user_id: 'user-1',
  name: 'Groceries',
  icon: '🛒',
  type: 'expense',
  is_default: true,
};

const rent: Category = {
  id: 'cat-rent',
  user_id: 'user-1',
  name: 'Rent',
  icon: '🏠',
  type: 'expense',
  is_default: true,
};

function expense(
  partial: Partial<ExpenseWithDetails> & Pick<ExpenseWithDetails, 'id' | 'amount' | 'category_id'>
): ExpenseWithDetails {
  return {
    user_id: 'user-1',
    description: null,
    expense_date: '2026-09-28',
    payment_method: 'UPI',
    family_member_id: null,
    created_at: '2026-09-28T10:00:00.000Z',
    category: null,
    family_member: null,
    ...partial,
  };
}

describe('calculateMonthlyTotal', () => {
  it('sums expense amounts', () => {
    expect(calculateMonthlyTotal([{ amount: 850 }, { amount: 1000 }, { amount: 450 }])).toBe(2300);
  });

  it('returns 0 for an empty list', () => {
    expect(calculateMonthlyTotal([])).toBe(0);
  });
});

describe('calculateRemainingBudget', () => {
  it('subtracts spent from budget', () => {
    expect(calculateRemainingBudget(60000, 48650)).toBe(11350);
  });

  it('goes negative when over budget', () => {
    expect(calculateRemainingBudget(10000, 12000)).toBe(-2000);
  });
});

describe('calculateCategoryPercentage', () => {
  it('returns the share of the total', () => {
    expect(calculateCategoryPercentage(18000, 48650)).toBeCloseTo(37.0, 0);
  });

  it('returns 0 when total is 0', () => {
    expect(calculateCategoryPercentage(100, 0)).toBe(0);
  });
});

describe('calculateSavings', () => {
  it('subtracts expenses from income', () => {
    expect(calculateSavings(85000, 48650)).toBe(36350);
  });
});

describe('budget warnings', () => {
  it('warns at 80% and reaches at 100%', () => {
    expect(isBudgetWarning(8000, 10000)).toBe(true);
    expect(isBudgetReached(10000, 10000)).toBe(true);
    expect(isBudgetReached(9999, 10000)).toBe(false);
  });
});

describe('spendingByCategory', () => {
  it('groups and sorts categories by amount', () => {
    const result = spendingByCategory(
      [
        expense({ id: '1', amount: 8250, category_id: groceries.id }),
        expense({ id: '2', amount: 18000, category_id: rent.id }),
        expense({ id: '3', amount: 1750, category_id: groceries.id }),
      ],
      [groceries, rent]
    );

    expect(result[0]).toMatchObject({ name: 'Rent', amount: 18000 });
    expect(result[1]).toMatchObject({ name: 'Groceries', amount: 10000 });
  });
});

describe('buildMonthlyInsights', () => {
  it('describes grocery delta, top category, and remaining budget', () => {
    const insights = buildMonthlyInsights({
      currentExpenses: [
        expense({ id: '1', amount: 10000, category_id: groceries.id }),
        expense({ id: '2', amount: 18000, category_id: rent.id }),
      ],
      previousExpenses: [expense({ id: '3', amount: 8750, category_id: groceries.id })],
      categories: [groceries, rent],
      totalBudget: 60000,
      income: 85000,
      upcomingCountNextWeek: 3,
      monthLabel: 'September 2026',
    });

    expect(insights.map((item) => item.id)).toEqual(
      expect.arrayContaining(['grocery-delta', 'top-category', 'remaining', 'upcoming'])
    );
    expect(insights.find((item) => item.id === 'top-category')?.text).toContain('Rent represents 64%');
    expect(insights.find((item) => item.id === 'upcoming')?.text).toContain('3 recurring payments');
  });
});
