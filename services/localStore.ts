import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Budget } from '@/types/budget';
import type { Category } from '@/types/category';
import type { Expense } from '@/types/expense';
import type { FamilyMember } from '@/types/family';
import type { RecurringExpense } from '@/types/recurring';
import type { UserProfile } from '@/types/user';

const STORAGE_KEY = 'spendnest.local.db.v1';
const SESSION_KEY = 'spendnest.local.session.v1';

export type LocalUser = UserProfile & {
  password: string;
};

export type LocalSession = {
  userId: string;
  email: string;
};

export type LocalDatabase = {
  users: LocalUser[];
  categories: Category[];
  expenses: Expense[];
  budgets: Budget[];
  recurring_expenses: RecurringExpense[];
  family_members: FamilyMember[];
};

const emptyDb = (): LocalDatabase => ({
  users: [],
  categories: [],
  expenses: [],
  budgets: [],
  recurring_expenses: [],
  family_members: [],
});

let memory: LocalDatabase | null = null;
let writeQueue: Promise<void> = Promise.resolve();

export async function readDb(): Promise<LocalDatabase> {
  if (memory) return memory;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  memory = raw ? (JSON.parse(raw) as LocalDatabase) : emptyDb();
  return memory;
}

export async function writeDb(next: LocalDatabase): Promise<void> {
  memory = next;
  writeQueue = writeQueue.then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)));
  await writeQueue;
}

function cloneDb(db: LocalDatabase): LocalDatabase {
  return JSON.parse(JSON.stringify(db)) as LocalDatabase;
}

export async function updateDb<T>(mutator: (db: LocalDatabase) => T): Promise<T> {
  const db = cloneDb(await readDb());
  const result = mutator(db);
  await writeDb(db);
  return result;
}

export async function getLocalSession(): Promise<LocalSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as LocalSession) : null;
}

export async function setLocalSession(session: LocalSession | null): Promise<void> {
  if (!session) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function resetLocalData(): Promise<void> {
  memory = emptyDb();
  await AsyncStorage.multiRemove([STORAGE_KEY, SESSION_KEY]);
}
