import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { BudgetProgress } from '@/components/BudgetProgress';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { listBudgets, upsertBudget } from '@/services/budgetService';
import { listCategories } from '@/services/categoryService';
import { listExpenses } from '@/services/expenseService';
import type { Budget, CategoryBudgetProgress } from '@/types/budget';
import type { Category } from '@/types/category';
import type { ExpenseWithDetails } from '@/types/expense';
import {
  calculateMonthlyTotal,
  calculateRemainingBudget,
  filterExpensesByMonth,
  isBudgetReached,
} from '@/utils/calculations';
import { formatCurrency, parseAmount } from '@/utils/currency';
import { monthLabel, nowYearMonth, type YearMonth } from '@/utils/dates';
import { MonthSwitcher } from '@/components/MonthSwitcher';

export default function BudgetScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const [ym, setYm] = useState<YearMonth>(nowYearMonth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalInput, setTotalInput] = useState('');
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>({});
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);

  const reload = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [budgetRows, cats, items] = await Promise.all([
        listBudgets(profile.id, ym.month, ym.year),
        listCategories(profile.id),
        listExpenses(profile.id),
      ]);
      setBudgets(budgetRows);
      setCategories(cats);
      setExpenses(items);
      setTotalInput(String(budgetRows.find((item) => item.category_id === null)?.amount ?? ''));
      const next: Record<string, string> = {};
      for (const row of budgetRows) {
        if (row.category_id) next[row.category_id] = String(row.amount);
      }
      setCategoryInputs(next);
    } finally {
      setLoading(false);
    }
  }, [profile, ym.month, ym.year]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const monthExpenses = filterExpensesByMonth(expenses, ym);
  const spent = calculateMonthlyTotal(monthExpenses);
  const totalBudget = budgets.find((item) => item.category_id === null)?.amount ?? 0;
  const remaining = calculateRemainingBudget(totalBudget, spent);

  const categoryProgress: CategoryBudgetProgress[] = useMemo(() => {
    return categories
      .map((category) => {
        const budget = budgets.find((item) => item.category_id === category.id)?.amount ?? 0;
        const categorySpent = monthExpenses
          .filter((item) => item.category_id === category.id)
          .reduce((sum, item) => sum + item.amount, 0);
        return {
          category_id: category.id,
          category_name: category.name,
          category_icon: category.icon,
          spent: categorySpent,
          budget,
          remaining: budget - categorySpent,
          percent: budget > 0 ? (categorySpent / budget) * 100 : 0,
        };
      })
      .filter((item) => item.budget > 0 || item.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categories, budgets, monthExpenses]);

  const reached = categoryProgress.filter((item) => isBudgetReached(item.spent, item.budget));

  async function saveBudgets() {
    if (!profile) return;
    setSaving(true);
    try {
      const total = parseAmount(totalInput);
      if (total > 0) {
        await upsertBudget(profile.id, {
          category_id: null,
          month: ym.month,
          year: ym.year,
          amount: total,
        });
      }
      for (const category of categories) {
        const amount = parseAmount(categoryInputs[category.id] ?? '');
        if (amount > 0) {
          await upsertBudget(profile.id, {
            category_id: category.id,
            month: ym.month,
            year: ym.year,
            amount,
          });
        }
      }
      await reload();
      Alert.alert('Saved', 'Your monthly budgets were updated.');
    } catch (err) {
      Alert.alert('Could not save', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.ink }]}>{monthLabel(ym)} Budget</Text>
      <MonthSwitcher value={ym} onChange={setYm} />

      {loading ? (
        <ActivityIndicator color={theme.forest} style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.stack}>
          <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.meta, { color: theme.muted }]}>Total Budget</Text>
            <Text style={[styles.amount, { color: theme.ink }]}>
              {totalBudget ? formatCurrency(totalBudget) : 'Not set'}
            </Text>
            <Text style={{ color: theme.muted }}>Used {formatCurrency(spent)}</Text>
            <Text style={{ color: remaining < 0 ? theme.danger : theme.leaf }}>
              Remaining {formatCurrency(remaining)}
            </Text>
            {totalBudget > 0 ? <BudgetProgress spent={spent} budget={totalBudget} /> : null}
          </View>

          {reached.map((item) => (
            <View
              key={item.category_id}
              style={[styles.warning, { backgroundColor: theme.warningSoft, borderColor: theme.gold }]}>
              <Text style={[styles.warningTitle, { color: theme.warning }]}>
                ⚠️ {item.category_name} budget reached
              </Text>
              <Text style={{ color: theme.ink }}>
                You&apos;ve spent {formatCurrency(item.spent)} of your {formatCurrency(item.budget)}{' '}
                budget.
              </Text>
            </View>
          ))}

          <TextField
            label="Total monthly budget"
            prefix="₹"
            value={totalInput}
            onChangeText={setTotalInput}
            keyboardType="decimal-pad"
            placeholder="60000"
          />

          {categoryProgress.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="No category budgets yet"
              subtitle="Add amounts below for groceries, fuel, and anything else you want to cap."
            />
          ) : (
            categoryProgress.map((item) => (
              <View
                key={item.category_id}
                style={[styles.category, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.categoryTitle, { color: theme.ink }]}>
                  {item.category_icon} {item.category_name}
                </Text>
                <Text style={{ color: theme.muted }}>
                  {formatCurrency(item.spent)} / {item.budget ? formatCurrency(item.budget) : 'no cap'}
                </Text>
                {item.budget > 0 ? <BudgetProgress spent={item.spent} budget={item.budget} /> : null}
              </View>
            ))
          )}

          <Text style={[styles.sectionTitle, { color: theme.ink }]}>Set category budgets</Text>
          {categories.map((category) => (
            <TextField
              key={category.id}
              label={`${category.icon} ${category.name}`}
              prefix="₹"
              value={categoryInputs[category.id] ?? ''}
              onChangeText={(value) =>
                setCategoryInputs((current) => ({ ...current, [category.id]: value }))
              }
              keyboardType="decimal-pad"
              placeholder="0"
            />
          ))}

          <PrimaryButton
            label={saving ? 'Saving…' : 'Save budgets'}
            onPress={saveBudgets}
            disabled={saving}
          />
        </View>
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
  stack: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  summary: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  meta: {
    fontSize: 13,
    fontWeight: '700',
  },
  amount: {
    fontSize: 28,
    fontWeight: '800',
  },
  warning: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  warningTitle: {
    fontWeight: '800',
    fontSize: 16,
  },
  category: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
});
