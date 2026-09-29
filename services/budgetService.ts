import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { readDb, updateDb } from '@/services/localStore';
import { createId } from '@/utils/id';
import type { Budget } from '@/types/budget';

export async function listBudgets(userId: string, month: number, year: number): Promise<Budget[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year);
    if (error) throw error;
    return ((data ?? []) as Budget[]).map((item) => ({ ...item, amount: Number(item.amount) }));
  }

  const db = await readDb();
  return db.budgets.filter(
    (item) => item.user_id === userId && item.month === month && item.year === year
  );
}

export async function upsertBudget(
  userId: string,
  input: { category_id: string | null; month: number; year: number; amount: number }
): Promise<Budget> {
  if (isSupabaseConfigured() && supabase) {
    let existingQuery = supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', input.month)
      .eq('year', input.year);

    existingQuery =
      input.category_id === null
        ? existingQuery.is('category_id', null)
        : existingQuery.eq('category_id', input.category_id);

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('budgets')
        .update({ amount: input.amount })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return { ...(data as Budget), amount: Number((data as Budget).amount) };
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category_id: input.category_id,
        month: input.month,
        year: input.year,
        amount: input.amount,
      })
      .select()
      .single();
    if (error) throw error;
    return { ...(data as Budget), amount: Number((data as Budget).amount) };
  }

  return updateDb((db) => {
    const existing = db.budgets.find(
      (item) =>
        item.user_id === userId &&
        item.month === input.month &&
        item.year === input.year &&
        item.category_id === input.category_id
    );
    if (existing) {
      existing.amount = input.amount;
      return existing;
    }
    const saved: Budget = {
      id: createId(),
      user_id: userId,
      category_id: input.category_id,
      month: input.month,
      year: input.year,
      amount: input.amount,
    };
    db.budgets.push(saved);
    return saved;
  });
}

export function totalBudgetFrom(budgets: Budget[]): number {
  return budgets.find((item) => item.category_id === null)?.amount ?? 0;
}
