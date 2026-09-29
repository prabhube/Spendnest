import AsyncStorage from '@react-native-async-storage/async-storage';

import { ensureHouseholdDefaults, updateMonthlyIncome } from '@/services/authService';
import { addExpense, deleteExpense } from '@/services/expenseService';
import { upsertBudget } from '@/services/budgetService';
import { addRecurring, deleteRecurring, listRecurring } from '@/services/recurringService';
import { listCategories } from '@/services/categoryService';
import { listFamilyMembers } from '@/services/familyService';
import { todayISO } from '@/utils/dates';
import type { UserProfile } from '@/types/user';

const sampleKey = (userId: string) => `spendnest.sample.ids.${userId}`;

type SampleIds = {
  expenseIds: string[];
  recurringIds: string[];
};

function categoryIdByName(categories: { id: string; name: string }[], name: string) {
  const found = categories.find(
    (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (!found) throw new Error(`Missing category: ${name}. Try logging out and back in.`);
  return found.id;
}

async function readSampleIds(userId: string): Promise<SampleIds> {
  const raw = await AsyncStorage.getItem(sampleKey(userId));
  if (!raw) return { expenseIds: [], recurringIds: [] };
  try {
    return JSON.parse(raw) as SampleIds;
  } catch {
    return { expenseIds: [], recurringIds: [] };
  }
}

async function writeSampleIds(userId: string, ids: SampleIds) {
  await AsyncStorage.setItem(sampleKey(userId), JSON.stringify(ids));
}

export async function loadSampleData(userId: string, userName: string): Promise<UserProfile> {
  await ensureHouseholdDefaults(userId, userName);

  const previous = await readSampleIds(userId);
  for (const id of previous.expenseIds) {
    try {
      await deleteExpense(userId, id);
    } catch {
      // Ignore stale ids from an older sample load.
    }
  }
  for (const id of previous.recurringIds) {
    try {
      await deleteRecurring(userId, id);
    } catch {
      // Ignore stale ids from an older sample load.
    }
  }

  const categories = await listCategories(userId);
  const members = await listFamilyMembers(userId);
  const memberId = members[0]?.id ?? null;
  const today = todayISO();
  const [year, month] = today.split('-').map(Number);
  const monthPart = String(month).padStart(2, '0');
  const id = (name: string) => categoryIdByName(categories, name);

  const profile = await updateMonthlyIncome(userId, 85000);
  await upsertBudget(userId, { category_id: null, month, year, amount: 60000 });
  await upsertBudget(userId, { category_id: id('Groceries'), month, year, amount: 10000 });
  await upsertBudget(userId, { category_id: id('Fuel'), month, year, amount: 6000 });
  await upsertBudget(userId, { category_id: id('Food'), month, year, amount: 4000 });

  const samples: Array<{
    category: string;
    amount: number;
    description: string;
    date: string;
    payment: string;
  }> = [
    { category: 'Rent', amount: 18000, description: 'House rent', date: `${year}-${monthPart}-01`, payment: 'UPI' },
    { category: 'Groceries', amount: 8250, description: 'Rice + vegetables', date: today, payment: 'UPI' },
    { category: 'Fuel', amount: 5500, description: 'Petrol', date: today, payment: 'Credit Card' },
    { category: 'Medical', amount: 3200, description: 'Medicine', date: today, payment: 'UPI' },
    { category: 'Food', amount: 3650, description: 'Dining out', date: today, payment: 'UPI' },
    { category: 'Electricity', amount: 1850, description: 'EB bill', date: `${year}-${monthPart}-05`, payment: 'UPI' },
    { category: 'Mobile', amount: 999, description: 'Jio recharge', date: `${year}-${monthPart}-08`, payment: 'UPI' },
    { category: 'Internet', amount: 799, description: 'Home broadband', date: `${year}-${monthPart}-10`, payment: 'UPI' },
    { category: 'Shopping', amount: 6402, description: 'Household items', date: today, payment: 'UPI' },
  ];

  const expenseIds: string[] = [];
  for (const sample of samples) {
    const created = await addExpense(userId, {
      category_id: id(sample.category),
      amount: sample.amount,
      description: sample.description,
      expense_date: sample.date,
      payment_method: sample.payment,
      family_member_id: memberId,
    });
    expenseIds.push(created.id);
  }

  const recurringSpecs = [
    { category: 'Rent', amount: 18000, description: 'House Rent', due_day: 1 },
    { category: 'Electricity', amount: 1850, description: 'EB', due_day: 5 },
    { category: 'Mobile', amount: 999, description: 'Jio', due_day: 8 },
    { category: 'Internet', amount: 799, description: 'Internet', due_day: 10 },
  ];

  const recurringIds: string[] = [];
  const existingRecurring = await listRecurring(userId);
  for (const spec of recurringSpecs) {
    const already = existingRecurring.find(
      (item) => item.description === spec.description && item.amount === spec.amount
    );
    if (already) {
      recurringIds.push(already.id);
      continue;
    }
    const created = await addRecurring(userId, {
      category_id: id(spec.category),
      amount: spec.amount,
      description: spec.description,
      frequency: 'monthly',
      due_day: spec.due_day,
      start_date: today,
    });
    recurringIds.push(created.id);
  }

  await writeSampleIds(userId, { expenseIds, recurringIds });
  return { ...profile, monthly_income: 85000 };
}
