import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { readDb, updateDb } from '@/services/localStore';
import { createId } from '@/utils/id';
import type { Category } from '@/types/category';
import type { CreateRecurringInput, RecurringExpense, RecurringExpenseWithCategory } from '@/types/recurring';

function withCategory(
  items: RecurringExpense[],
  categories: Category[]
): RecurringExpenseWithCategory[] {
  return items
    .map((item) => ({
      ...item,
      category: categories.find((category) => category.id === item.category_id) ?? null,
    }))
    .sort((a, b) => a.due_day - b.due_day);
}

export async function listRecurring(userId: string): Promise<RecurringExpenseWithCategory[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('due_day');
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      user_id: row.user_id as string,
      category_id: row.category_id as string,
      amount: Number(row.amount),
      description: row.description as string,
      frequency: row.frequency as RecurringExpense['frequency'],
      due_day: Number(row.due_day),
      start_date: row.start_date as string,
      end_date: (row.end_date as string | null) ?? null,
      is_active: Boolean(row.is_active),
      category: (row.categories as Category | null) ?? null,
    }));
  }

  const db = await readDb();
  return withCategory(
    db.recurring_expenses.filter((item) => item.user_id === userId),
    db.categories
  );
}

export async function addRecurring(
  userId: string,
  input: CreateRecurringInput
): Promise<RecurringExpense> {
  const item: RecurringExpense = {
    id: createId(),
    user_id: userId,
    category_id: input.category_id,
    amount: input.amount,
    description: input.description.trim(),
    frequency: input.frequency,
    due_day: input.due_day,
    start_date: input.start_date,
    end_date: input.end_date ?? null,
    is_active: true,
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert({
        user_id: userId,
        category_id: item.category_id,
        amount: item.amount,
        description: item.description,
        frequency: item.frequency,
        due_day: item.due_day,
        start_date: item.start_date,
        end_date: item.end_date,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return data as RecurringExpense;
  }

  await updateDb((db) => {
    db.recurring_expenses.push(item);
  });
  return item;
}

export async function toggleRecurring(userId: string, id: string, isActive: boolean): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('recurring_expenses')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return;
  }

  await updateDb((db) => {
    const item = db.recurring_expenses.find((row) => row.id === id && row.user_id === userId);
    if (item) item.is_active = isActive;
  });
}

export async function deleteRecurring(userId: string, id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('recurring_expenses').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return;
  }

  await updateDb((db) => {
    db.recurring_expenses = db.recurring_expenses.filter(
      (item) => !(item.id === id && item.user_id === userId)
    );
  });
}
