import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { ExpenseForm, type ExpenseFormValues } from '@/components/ExpenseForm';
import { Screen } from '@/components/Screen';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { listCategories } from '@/services/categoryService';
import { addExpense } from '@/services/expenseService';
import { listFamilyMembers } from '@/services/familyService';
import { addRecurring } from '@/services/recurringService';
import type { Category } from '@/types/category';
import type { FamilyMember } from '@/types/family';
import { parseISODate } from '@/utils/dates';

export default function AddExpenseScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [formKey, setFormKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      let cancelled = false;
      (async () => {
        setLoading(true);
        const [cats, family] = await Promise.all([
          listCategories(profile.id),
          listFamilyMembers(profile.id),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setMembers(family);
        setFormKey(Date.now());
        setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [profile])
  );

  async function handleSubmit(values: ExpenseFormValues) {
    if (!profile) return;
    await addExpense(profile.id, values);
    if (values.recurring) {
      await addRecurring(profile.id, {
        category_id: values.category_id,
        amount: values.amount,
        description: values.description?.trim() || 'Recurring expense',
        frequency: 'monthly',
        due_day: parseISODate(values.expense_date).getDate(),
        start_date: values.expense_date,
      });
    }
    router.replace('/(tabs)/home');
  }

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.ink }]}>Add Expense</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Amount and category are enough. Everything else is optional.
      </Text>
      {loading ? (
        <ActivityIndicator color={theme.forest} style={{ marginTop: 24 }} />
      ) : (
        <ExpenseForm
          key={formKey || 'loading'}
          categories={categories}
          members={members}
          initial={{
            category_id: categories.find((category) => category.name === 'Groceries')?.id,
            payment_method: 'UPI',
            family_member_id: members[0]?.id,
          }}
          submitLabel="SAVE EXPENSE"
          showRecurring
          onSubmit={handleSubmit}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
});
