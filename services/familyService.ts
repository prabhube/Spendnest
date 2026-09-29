import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { readDb, updateDb } from '@/services/localStore';
import { createId } from '@/utils/id';
import type { FamilyMember } from '@/types/family';

export async function listFamilyMembers(userId: string): Promise<FamilyMember[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;
    return (data ?? []) as FamilyMember[];
  }

  const db = await readDb();
  return db.family_members
    .filter((item) => item.user_id === userId)
    .sort((a, b) => {
      if (a.relationship === 'self' && b.relationship !== 'self') return -1;
      if (b.relationship === 'self' && a.relationship !== 'self') return 1;
      return a.name.localeCompare(b.name);
    });
}

export async function createFamilyMember(
  userId: string,
  input: { name: string; relationship: string }
): Promise<FamilyMember> {
  const member: FamilyMember = {
    id: createId(),
    user_id: userId,
    name: input.name.trim(),
    relationship: input.relationship,
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        user_id: userId,
        name: member.name,
        relationship: member.relationship,
      })
      .select()
      .single();
    if (error) throw error;
    return data as FamilyMember;
  }

  await updateDb((db) => {
    db.family_members.push(member);
  });
  return member;
}

export async function updateFamilyMember(
  userId: string,
  id: string,
  input: { name: string; relationship: string }
): Promise<FamilyMember> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('family_members')
      .update({
        name: input.name.trim(),
        relationship: input.relationship,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as FamilyMember;
  }

  return updateDb((db) => {
    const member = db.family_members.find((item) => item.id === id && item.user_id === userId);
    if (!member) throw new Error('Family member not found.');
    member.name = input.name.trim();
    member.relationship = input.relationship;
    return member;
  });
}

export async function deleteFamilyMember(userId: string, id: string): Promise<void> {
  const current = await listFamilyMembers(userId);
  if (current.length <= 1) {
    throw new Error('Keep at least one family member.');
  }

  if (isSupabaseConfigured() && supabase) {
    await supabase
      .from('expenses')
      .update({ family_member_id: null })
      .eq('user_id', userId)
      .eq('family_member_id', id);
    const { error } = await supabase.from('family_members').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return;
  }

  await updateDb((db) => {
    db.family_members = db.family_members.filter((item) => !(item.id === id && item.user_id === userId));
    for (const expense of db.expenses) {
      if (expense.family_member_id === id) expense.family_member_id = null;
    }
  });
}
