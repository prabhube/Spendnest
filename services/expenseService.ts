import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { readDb, updateDb } from '@/services/localStore';
import { createId } from '@/utils/id';
import type { CreateExpenseInput, Expense, ExpenseWithDetails } from '@/types/expense';
import type { Category } from '@/types/category';
import type { FamilyMember } from '@/types/family';

function attachDetails(
  expenses: Expense[],
  categories: Category[],
  members: FamilyMember[]
): ExpenseWithDetails[] {
  return expenses
    .map((expense) => ({
      ...expense,
      category: categories.find((item) => item.id === expense.category_id) ?? null,
      family_member: members.find((item) => item.id === expense.family_member_id) ?? null,
    }))
    .sort((a, b) => {
      if (a.expense_date === b.expense_date) return b.created_at.localeCompare(a.created_at);
      return b.expense_date.localeCompare(a.expense_date);
    });
}

export async function listExpenses(userId: string): Promise<ExpenseWithDetails[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, categories(*), family_members(*)')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false });
    if (error) throw error;

    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      user_id: row.user_id as string,
      category_id: row.category_id as string,
      amount: Number(row.amount),
      description: (row.description as string | null) ?? null,
      expense_date: row.expense_date as string,
      payment_method: (row.payment_method as string | null) ?? null,
      family_member_id: (row.family_member_id as string | null) ?? null,
      created_at: row.created_at as string,
      category: (row.categories as Category | null) ?? null,
      family_member: (row.family_members as FamilyMember | null) ?? null,
    }));
  }

  const db = await readDb();
  return attachDetails(
    db.expenses.filter((item) => item.user_id === userId),
    db.categories,
    db.family_members
  );
}

export async function getExpense(userId: string, id: string): Promise<ExpenseWithDetails | null> {
  const expenses = await listExpenses(userId);
  return expenses.find((item) => item.id === id) ?? null;
}

export async function addExpense(userId: string, input: CreateExpenseInput): Promise<Expense> {
  const expense: Expense = {
    id: createId(),
    user_id: userId,
    category_id: input.category_id,
    amount: input.amount,
    description: input.description?.trim() || null,
    expense_date: input.expense_date,
    payment_method: input.payment_method || null,
    family_member_id: input.family_member_id || null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        category_id: expense.category_id,
        amount: expense.amount,
        description: expense.description,
        expense_date: expense.expense_date,
        payment_method: expense.payment_method,
        family_member_id: expense.family_member_id,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Expense;
  }

  await updateDb((db) => {
    db.expenses.push(expense);
  });
  return expense;
}

export async function updateExpense(
  userId: string,
  id: string,
  input: CreateExpenseInput
): Promise<Expense> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        category_id: input.category_id,
        amount: input.amount,
        description: input.description?.trim() || null,
        expense_date: input.expense_date,
        payment_method: input.payment_method || null,
        family_member_id: input.family_member_id || null,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Expense;
  }

  return updateDb((db) => {
    const expense = db.expenses.find((item) => item.id === id && item.user_id === userId);
    if (!expense) throw new Error('Expense not found.');
    expense.category_id = input.category_id;
    expense.amount = input.amount;
    expense.description = input.description?.trim() || null;
    expense.expense_date = input.expense_date;
    expense.payment_method = input.payment_method || null;
    expense.family_member_id = input.family_member_id || null;
    return expense;
  });
}

export async function deleteExpense(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return;
  }

  await updateDb((db) => {
    db.expenses = db.expenses.filter((item) => !(item.id === id && item.user_id === userId));
  });
}
