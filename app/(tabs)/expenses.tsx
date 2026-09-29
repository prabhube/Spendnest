import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { ChipRow } from '@/components/ChipRow';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseCard } from '@/components/ExpenseCard';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { Screen } from '@/components/Screen';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { listCategories } from '@/services/categoryService';
import { listExpenses } from '@/services/expenseService';
import { listFamilyMembers } from '@/services/familyService';
import type { Category } from '@/types/category';
import type { FamilyMember } from '@/types/family';
import type { ExpenseWithDetails } from '@/types/expense';
import { filterExpensesByMonth } from '@/utils/calculations';
import { dateGroupLabel, monthLabel, nowYearMonth, type YearMonth } from '@/utils/dates';

export default function ExpensesScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const [ym, setYm] = useState<YearMonth>(nowYearMonth);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [memberId, setMemberId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const [items, cats, family] = await Promise.all([
            listExpenses(profile.id),
            listCategories(profile.id),
            listFamilyMembers(profile.id),
          ]);
          if (cancelled) return;
          setExpenses(items);
          setCategories(cats);
          setMembers(family);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [profile])
  );

  const filtered = useMemo(() => {
    const monthItems = filterExpensesByMonth(expenses, ym);
    const needle = query.trim().toLowerCase();
    return monthItems.filter((item) => {
      const categoryOk = categoryId === 'all' || item.category_id === categoryId;
      const memberOk = memberId === 'all' || item.family_member_id === memberId;
      if (!categoryOk || !memberOk) return false;
      if (!needle) return true;
      const haystack = [
        item.description ?? '',
        item.category?.name ?? '',
        item.payment_method ?? '',
        String(item.amount),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [expenses, ym, query, categoryId, memberId]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: ExpenseWithDetails[] }[] = [];
    for (const item of filtered) {
      const label = dateGroupLabel(item.expense_date);
      const existing = groups.find((group) => group.label === label);
      if (existing) existing.items.push(item);
      else groups.push({ label, items: [item] });
    }
    return groups;
  }, [filtered]);

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.ink }]}>{monthLabel(ym)}</Text>
      <MonthSwitcher value={ym} onChange={setYm} />

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder='Search: "medical expenses"'
        placeholderTextColor={theme.muted}
        style={[
          styles.search,
          { backgroundColor: theme.card, borderColor: theme.border, color: theme.ink },
        ]}
      />

      <ChipRow
        value={categoryId}
        onChange={setCategoryId}
        options={[
          { id: 'all', label: 'All' },
          ...categories.map((category) => ({
            id: category.id,
            label: `${category.icon} ${category.name}`,
          })),
        ]}
      />
      {members.length > 0 ? (
        <View style={{ marginTop: spacing.sm }}>
          <ChipRow
            value={memberId}
            onChange={setMemberId}
            options={[
              { id: 'all', label: 'All members' },
              ...members.map((member) => ({ id: member.id, label: member.name })),
            ]}
          />
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={theme.forest} style={{ marginTop: 24 }} />
      ) : grouped.length === 0 ? (
        <View style={{ marginTop: spacing.lg }}>
          <EmptyState
            icon="📄"
            title="No matching expenses"
            subtitle="Try another month, category, or search term."
          />
        </View>
      ) : (
        grouped.map((group) => (
          <View key={group.label} style={styles.group}>
            <Text style={[styles.groupLabel, { color: theme.muted }]}>{group.label}</Text>
            {group.items.map((item) => (
              <ExpenseCard
                key={item.id}
                expense={item}
                onPress={() => router.push(`/expense/${item.id}`)}
              />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  search: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    fontSize: 16,
  },
  group: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
