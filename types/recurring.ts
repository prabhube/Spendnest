import type { Category } from './category';

export type RecurringFrequency = 'monthly' | 'weekly' | 'yearly';

export type RecurringExpense = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  due_day: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
};

export type RecurringExpenseWithCategory = RecurringExpense & {
  category: Category | null;
};

export type CreateRecurringInput = {
  category_id: string;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  due_day: number;
  start_date: string;
  end_date?: string | null;
};
