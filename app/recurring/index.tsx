import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { BackLink } from '@/components/BackLink';
import { ChipRow } from '@/components/ChipRow';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { listCategories } from '@/services/categoryService';
import { addRecurring, deleteRecurring, listRecurring } from '@/services/recurringService';
import type { Category } from '@/types/category';
import type { RecurringExpenseWithCategory } from '@/types/recurring';
import { formatCurrency, parseAmount } from '@/utils/currency';
import { todayISO } from '@/utils/dates';

export default function RecurringScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RecurringExpenseWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [rows, cats] = await Promise.all([
        listRecurring(profile.id),
        listCategories(profile.id),
      ]);
      setItems(rows);
      setCategories(cats);
      if (!categoryId && cats[0]) setCategoryId(cats[0].id);
    } finally {
      setLoading(false);
    }
  }, [profile, categoryId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  async function handleAdd() {
    if (!profile) return;
    const parsed = parseAmount(amount);
    const day = Number.parseInt(dueDay, 10);
    if (!description.trim() || parsed <= 0 || !categoryId || day < 1 || day > 31) {
      Alert.alert('Check the form', 'Add a name, amount, category, and due day between 1 and 31.');
      return;
    }
    setSaving(true);
    try {
      await addRecurring(profile.id, {
        category_id: categoryId,
        amount: parsed,
        description: description.trim(),
        frequency: 'monthly',
        due_day: day,
        start_date: todayISO(),
      });
      setDescription('');
      setAmount('');
      await reload();
    } catch (err) {
      Alert.alert('Could not save', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <BackLink />
      {loading ? (
        <ActivityIndicator color={theme.forest} />
      ) : (
        <View style={styles.stack}>
          {items.length === 0 ? (
            <EmptyState
              icon="🔁"
              title="No recurring payments"
              subtitle="Add rent, electricity, mobile, or EMI so they show up on the dashboard."
            />
          ) : (
            items.map((item) => (
              <View
                key={item.id}
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={styles.icon}>{item.category?.icon ?? '📅'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: theme.ink }]}>{item.description}</Text>
                  <Text style={{ color: theme.muted }}>
                    Every month · Due: {item.due_day}
                    {ordinal(item.due_day)}
                  </Text>
                </View>
                <Text style={[styles.amount, { color: theme.ink }]}>{formatCurrency(item.amount)}</Text>
                <Pressable
                  onPress={() =>
                    Alert.alert('Remove this bill?', item.description, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          if (!profile) return;
                          await deleteRecurring(profile.id, item.id);
                          await reload();
                        },
                      },
                    ])
                  }>
                  <Text style={{ color: theme.danger, fontWeight: '700' }}>✕</Text>
                </Pressable>
              </View>
            ))
          )}

          <Text style={[styles.section, { color: theme.ink }]}>+ Add Recurring Expense</Text>
          <TextField label="Name" value={description} onChangeText={setDescription} placeholder="House Rent" />
          <TextField
            label="Amount"
            prefix="₹"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="18000"
          />
          <TextField
            label="Due day"
            value={dueDay}
            onChangeText={setDueDay}
            keyboardType="number-pad"
            placeholder="1"
          />
          <ChipRow
            value={categoryId}
            onChange={setCategoryId}
            options={categories.map((category) => ({
              id: category.id,
              label: `${category.icon} ${category.name}`,
            }))}
          />
          <PrimaryButton label={saving ? 'Adding…' : 'Add recurring expense'} onPress={handleAdd} disabled={saving} />
        </View>
      )}
    </Screen>
  );
}

function ordinal(day: number) {
  if (day % 10 === 1 && day !== 11) return 'st';
  if (day % 10 === 2 && day !== 12) return 'nd';
  if (day % 10 === 3 && day !== 13) return 'rd';
  return 'th';
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  amount: {
    fontWeight: '800',
  },
  section: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: '800',
  },
});
