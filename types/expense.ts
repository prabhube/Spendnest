import type { Category } from './category';
import type { FamilyMember } from './family';

export type Expense = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string | null;
  expense_date: string;
  payment_method: string | null;
  family_member_id: string | null;
  created_at: string;
};

export type ExpenseWithDetails = Expense & {
  category: Category | null;
  family_member: FamilyMember | null;
};

export type CreateExpenseInput = {
  category_id: string;
  amount: number;
  description?: string | null;
  expense_date: string;
  payment_method?: string | null;
  family_member_id?: string | null;
};
