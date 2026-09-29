import type { Category } from '@/types/category';
import type { Expense, ExpenseWithDetails } from '@/types/expense';
import type { RecurringExpenseWithCategory } from '@/types/recurring';
import { daysUntil, dueDateForMonth, inYearMonth, shiftMonth, type YearMonth } from '@/utils/dates';

export function calculateMonthlyTotal(expenses: Pick<Expense, 'amount'>[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateRemainingBudget(budget: number, spent: number): number {
  return budget - spent;
}

export function calculateCategoryPercentage(spent: number, total: number): number {
  if (total <= 0) return 0;
  return (spent / total) * 100;
}

export function calculateSavings(income: number, expenses: number): number {
  return income - expenses;
}

export function isBudgetReached(spent: number, budget: number): boolean {
  return budget > 0 && spent >= budget;
}

export function isBudgetWarning(spent: number, budget: number): boolean {
  return budget > 0 && calculateCategoryPercentage(spent, budget) >= 80;
}

export type CategorySpend = {
  category_id: string;
  name: string;
  icon: string;
  amount: number;
  percent: number;
};

export function spendingByCategory(
  expenses: ExpenseWithDetails[],
  categories: Category[]
): CategorySpend[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    totals.set(expense.category_id, (totals.get(expense.category_id) ?? 0) + expense.amount);
  }

  const monthlyTotal = calculateMonthlyTotal(expenses);
  return [...totals.entries()]
    .map(([category_id, amount]) => {
      const category = categories.find((item) => item.id === category_id);
      return {
        category_id,
        name: category?.name ?? 'Other',
        icon: category?.icon ?? '📦',
        amount,
        percent: calculateCategoryPercentage(amount, monthlyTotal),
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export type UpcomingPayment = {
  id: string;
  title: string;
  icon: string;
  amount: number;
  due_date: string;
  days_until: number;
};

export function getUpcomingPayments(
  recurring: RecurringExpenseWithCategory[],
  ym: YearMonth,
  todayISODate: string,
  withinDays = 30
): UpcomingPayment[] {
  return recurring
    .filter((item) => item.is_active)
    .map((item) => {
      const dueThisMonth = dueDateForMonth(item.due_day, ym);
      const dueDate =
        daysUntil(dueThisMonth, todayISODate) < 0
          ? dueDateForMonth(item.due_day, shiftMonth(ym, 1))
          : dueThisMonth;

      return {
        id: item.id,
        title: item.description,
        icon: item.category?.icon ?? '📅',
        amount: item.amount,
        due_date: dueDate,
        days_until: daysUntil(dueDate, todayISODate),
      };
    })
    .filter((item) => item.days_until >= 0 && item.days_until <= withinDays)
    .sort((a, b) => a.days_until - b.days_until);
}

export type MonthlyInsight = {
  id: string;
  icon: string;
  text: string;
};

export function buildMonthlyInsights(input: {
  currentExpenses: ExpenseWithDetails[];
  previousExpenses: ExpenseWithDetails[];
  categories: Category[];
  totalBudget: number;
  income: number;
  upcomingCountNextWeek: number;
  monthLabel: string;
}): MonthlyInsight[] {
  const insights: MonthlyInsight[] = [];
  const spent = calculateMonthlyTotal(input.currentExpenses);
  const previousSpent = calculateMonthlyTotal(input.previousExpenses);
  const remaining = calculateRemainingBudget(input.totalBudget, spent);
  const currentByCategory = spendingByCategory(input.currentExpenses, input.categories);
  const previousByCategory = spendingByCategory(input.previousExpenses, input.categories);

  const grocery = currentByCategory.find((item) => item.name === 'Groceries');
  const previousGrocery = previousByCategory.find((item) => item.name === 'Groceries');
  if (grocery && previousGrocery) {
    const delta = grocery.amount - previousGrocery.amount;
    if (delta !== 0) {
      const direction = delta > 0 ? 'higher' : 'lower';
      insights.push({
        id: 'grocery-delta',
        icon: '📈',
        text: `Your grocery spending is ₹${Math.abs(Math.round(delta)).toLocaleString('en-IN')} ${direction} than last month.`,
      });
    }
  }

  const top = currentByCategory[0];
  if (top && spent > 0) {
    insights.push({
      id: 'top-category',
      icon: top.icon,
      text: `${top.name} represents ${Math.round(top.percent)}% of your monthly expenses.`,
    });
  }

  if (input.totalBudget > 0) {
    insights.push({
      id: 'remaining',
      icon: '💰',
      text:
        remaining >= 0
          ? `You have ₹${Math.round(remaining).toLocaleString('en-IN')} remaining from your monthly budget.`
          : `You are ₹${Math.round(Math.abs(remaining)).toLocaleString('en-IN')} over your monthly budget.`,
    });
  }

  if (input.upcomingCountNextWeek > 0) {
    insights.push({
      id: 'upcoming',
      icon: '📅',
      text: `${input.upcomingCountNextWeek} recurring payment${input.upcomingCountNextWeek === 1 ? ' is' : 's are'} coming up next week.`,
    });
  }

  if (insights.length === 0 && spent === 0) {
    insights.push({
      id: 'empty',
      icon: '🪺',
      text: `No ${input.monthLabel} expenses yet. Add your first one to start seeing insights.`,
    });
  }

  return insights;
}

export function filterExpensesByMonth(expenses: ExpenseWithDetails[], ym: YearMonth) {
  return expenses.filter((expense) => inYearMonth(expense.expense_date, ym));
}
