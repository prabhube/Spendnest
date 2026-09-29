import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { getLocalSession, setLocalSession, updateDb, readDb } from '@/services/localStore';
import { createId } from '@/utils/id';
import type { UserProfile } from '@/types/user';

function emailKey(email: string) {
  return email.trim().toLowerCase();
}

export async function ensureHouseholdDefaults(userId: string, name: string) {
  if (isSupabaseConfigured() && supabase) {
    const { data: existing } = await supabase.from('categories').select('name').eq('user_id', userId);
    const have = new Set((existing ?? []).map((row) => String(row.name)));
    const missing = DEFAULT_CATEGORIES.filter((category) => !have.has(category.name));
    if (missing.length) {
      await supabase.from('categories').insert(
        missing.map((category) => ({
          user_id: userId,
          name: category.name,
          icon: category.icon,
          type: category.type,
          is_default: true,
        }))
      );
    }

    const { data: members } = await supabase.from('family_members').select('id').eq('user_id', userId).limit(1);
    if (!members?.length) {
      await supabase.from('family_members').insert({
        user_id: userId,
        name,
        relationship: 'self',
      });
    }
    return;
  }

  await updateDb((db) => {
    const have = new Set(
      db.categories.filter((item) => item.user_id === userId).map((item) => item.name)
    );
    for (const category of DEFAULT_CATEGORIES) {
      if (!have.has(category.name)) {
        db.categories.push({
          id: createId(),
          user_id: userId,
          name: category.name,
          icon: category.icon,
          type: category.type,
          is_default: true,
        });
      }
    }

    const hasMember = db.family_members.some((item) => item.user_id === userId);
    if (!hasMember) {
      db.family_members.push({
        id: createId(),
        user_id: userId,
        name,
        relationship: 'self',
      });
    }
  });
}

export async function getSessionUserId(): Promise<string | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  }
  const session = await getLocalSession();
  return session?.userId ?? null;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data as UserProfile | null;
  }

  const db = await readDb();
  const local = db.users.find((user) => user.id === userId);
  if (!local) return null;
  const { password: _password, ...profile } = local;
  return profile;
}

export async function signUp(name: string, email: string, password: string): Promise<UserProfile> {
  const trimmedName = name.trim();
  const normalizedEmail = emailKey(email);

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name: trimmedName } },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Could not create account.');

    const profile: UserProfile = {
      id: data.user.id,
      name: trimmedName,
      email: normalizedEmail,
      monthly_income: 0,
      created_at: new Date().toISOString(),
    };

    await supabase.from('users').upsert(profile);
    await ensureHouseholdDefaults(profile.id, trimmedName);
    return profile;
  }

  const created = await updateDb((db) => {
    if (db.users.some((user) => emailKey(user.email) === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const user: UserProfile & { password: string } = {
      id: createId(),
      name: trimmedName,
      email: normalizedEmail,
      monthly_income: 0,
      created_at: new Date().toISOString(),
      password,
    };
    db.users.push(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      monthly_income: user.monthly_income,
      created_at: user.created_at,
    } satisfies UserProfile;
  });

  await setLocalSession({ userId: created.id, email: created.email });
  await ensureHouseholdDefaults(created.id, created.name);
  return created;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const normalizedEmail = emailKey(email);

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Login failed.');
    const profile = await getProfile(data.user.id);
    if (!profile) {
      const created: UserProfile = {
        id: data.user.id,
        name: (data.user.user_metadata?.name as string) || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        monthly_income: 0,
        created_at: new Date().toISOString(),
      };
      await supabase.from('users').upsert(created);
      await ensureHouseholdDefaults(created.id, created.name);
      return created;
    }
    await ensureHouseholdDefaults(profile.id, profile.name);
    return profile;
  }

  const db = await readDb();
  const user = db.users.find((item) => emailKey(item.email) === normalizedEmail);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }
  await setLocalSession({ userId: user.id, email: user.email });
  await ensureHouseholdDefaults(user.id, user.name);
  const { password: _password, ...profile } = user;
  return profile;
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
    return;
  }
  await setLocalSession(null);
}

export async function restoreSession(): Promise<UserProfile | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const profile = await getProfile(userId);
  if (profile) await ensureHouseholdDefaults(profile.id, profile.name);
  return profile;
}

export async function updateMonthlyIncome(userId: string, monthlyIncome: number): Promise<UserProfile> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('users')
      .update({ monthly_income: monthlyIncome })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as UserProfile;
  }

  return updateDb((db) => {
    const user = db.users.find((item) => item.id === userId);
    if (!user) throw new Error('User not found.');
    user.monthly_income = monthlyIncome;
    const { password: _password, ...profile } = user;
    return profile;
  });
}
