import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { BackLink } from '@/components/BackLink';
import { ExpenseForm, type ExpenseFormValues } from '@/components/ExpenseForm';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { listCategories } from '@/services/categoryService';
import { deleteExpense, getExpense, updateExpense } from '@/services/expenseService';
import { listFamilyMembers } from '@/services/familyService';
import type { Category } from '@/types/category';
import type { ExpenseWithDetails } from '@/types/expense';
import type { FamilyMember } from '@/types/family';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState<ExpenseWithDetails | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    if (!profile || !id) return;
    (async () => {
      const [item, cats, family] = await Promise.all([
        getExpense(profile.id, id),
        listCategories(profile.id),
        listFamilyMembers(profile.id),
      ]);
      setExpense(item);
      setCategories(cats);
      setMembers(family);
      setLoading(false);
    })();
  }, [profile, id]);

  async function handleSubmit(values: ExpenseFormValues) {
    if (!profile || !id) return;
    await updateExpense(profile.id, id, values);
    router.back();
  }

  function handleDelete() {
    if (!profile || !id) return;
    Alert.alert('Delete expense?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(profile.id, id);
          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.forest} />
      </Screen>
    );
  }

  if (!expense) {
    return (
      <Screen>
        <Text style={{ color: theme.ink }}>This expense was not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackLink />
      <Text style={[styles.title, { color: theme.ink }]}>Edit expense</Text>
      <ExpenseForm
        categories={categories}
        members={members}
        submitLabel="SAVE CHANGES"
        initial={{
          amount: expense.amount,
          category_id: expense.category_id,
          description: expense.description ?? '',
          expense_date: expense.expense_date,
          payment_method: expense.payment_method,
          family_member_id: expense.family_member_id,
        }}
        onSubmit={handleSubmit}
      />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Delete expense" variant="danger" onPress={handleDelete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
});
