import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { readDb, updateDb } from '@/services/localStore';
import { createId } from '@/utils/id';
import type { Category } from '@/types/category';

export async function listCategories(userId: string): Promise<Category[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;
    return (data ?? []) as Category[];
  }

  const db = await readDb();
  return db.categories
    .filter((item) => item.user_id === userId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCategory(
  userId: string,
  input: { name: string; icon: string }
): Promise<Category> {
  const category: Category = {
    id: createId(),
    user_id: userId,
    name: input.name.trim(),
    icon: input.icon.trim() || '📦',
    type: 'expense',
    is_default: false,
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: category.name,
        icon: category.icon,
        type: category.type,
        is_default: false,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  }

  await updateDb((db) => {
    db.categories.push(category);
  });
  return category;
}
