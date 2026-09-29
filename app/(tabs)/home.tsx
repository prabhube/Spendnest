import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { BudgetProgress } from '@/components/BudgetProgress';
import { CategoryCard } from '@/components/CategoryCard';
import { EmptyState } from '@/components/EmptyState';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { PaymentCard } from '@/components/PaymentCard';
import { Screen } from '@/components/Screen';
import { SummaryCard } from '@/components/SummaryCard';
import { radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { listBudgets, totalBudgetFrom } from '@/services/budgetService';
import { listCategories } from '@/services/categoryService';
import { listExpenses } from '@/services/expenseService';
import { listRecurring } from '@/services/recurringService';
import type { Category } from '@/types/category';
import type { ExpenseWithDetails } from '@/types/expense';
import type { RecurringExpenseWithCategory } from '@/types/recurring';
import {
  buildMonthlyInsights,
  calculateMonthlyTotal,
  calculateRemainingBudget,
  calculateSavings,
  filterExpensesByMonth,
  getUpcomingPayments,
  spendingByCategory,
} from '@/utils/calculations';
import { formatCurrency } from '@/utils/currency';
import { greetingForHour, monthLabel, nowYearMonth, shiftMonth, todayISO, type YearMonth } from '@/utils/dates';

export default function HomeScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const [ym, setYm] = useState<YearMonth>(nowYearMonth);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpenseWithCategory[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const [allExpenses, cats, bills, budgets] = await Promise.all([
            listExpenses(profile.id),
            listCategories(profile.id),
            listRecurring(profile.id),
            listBudgets(profile.id, ym.month, ym.year),
          ]);
          if (cancelled) return;
          setExpenses(allExpenses);
          setCategories(cats);
          setRecurring(bills);
          setTotalBudget(totalBudgetFrom(budgets));
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [profile, ym.month, ym.year])
  );

  const firstName = profile?.name?.split(' ')[0] ?? 'there';
  const monthExpenses = filterExpensesByMonth(expenses, ym);
  const previousExpenses = filterExpensesByMonth(expenses, shiftMonth(ym, -1));
  const spent = calculateMonthlyTotal(monthExpenses);
  const remaining = calculateRemainingBudget(totalBudget, spent);
  const income = profile?.monthly_income ?? 0;
  const savings = calculateSavings(income, spent);
  const breakdown = spendingByCategory(monthExpenses, categories).slice(0, 5);
  const upcoming = getUpcomingPayments(recurring, ym, todayISO(), 40);
  const nextWeekCount = upcoming.filter((item) => item.days_until <= 7).length;
  const insights = buildMonthlyInsights({
    currentExpenses: monthExpenses,
    previousExpenses,
    categories,
    totalBudget,
    income,
    upcomingCountNextWeek: nextWeekCount,
    monthLabel: monthLabel(ym),
  });

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: theme.ink }]}>
            {greetingForHour(new Date().getHours())}, {firstName} 👋
          </Text>
          <MonthSwitcher value={ym} onChange={setYm} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.forest} style={{ marginTop: 32 }} />
      ) : (
        <View style={styles.stack}>
          <View style={[styles.spendCard, { backgroundColor: theme.forest }]}>
            <Text style={styles.spendLabel}>Monthly Spending</Text>
            <Text style={styles.spendAmount}>{formatCurrency(spent)}</Text>
            {totalBudget > 0 ? (
              <>
                <Text style={styles.spendMeta}>Budget {formatCurrency(totalBudget)}</Text>
                <BudgetProgress spent={spent} budget={totalBudget} compact />
                <Text style={styles.spendMeta}>Remaining {formatCurrency(remaining)}</Text>
              </>
            ) : (
              <Text style={styles.spendMeta}>Set a monthly budget from the Budget tab.</Text>
            )}
          </View>

          <SummaryCard income={income} expenses={spent} savings={savings} />

          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>Spending by Category</Text>
            {breakdown.length === 0 ? (
              <EmptyState
                icon="🛒"
                title="No expenses this month"
                subtitle="Tap + to add your first expense in under 10 seconds."
              />
            ) : (
              breakdown.map((item) => (
                <CategoryCard key={item.category_id} icon={item.icon} name={item.name} amount={item.amount} />
              ))
            )}
          </View>

          <View style={styles.block}>
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>Upcoming Payments</Text>
            {upcoming.length === 0 ? (
              <Text style={{ color: theme.muted }}>No recurring bills due soon.</Text>
            ) : (
              upcoming.slice(0, 4).map((item) => (
                <PaymentCard
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  amount={item.amount}
                  dueDate={item.due_date}
                />
              ))
            )}
          </View>

          <View style={styles.block}>
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>{monthLabel(ym)} Insights</Text>
            {insights.map((insight) => (
              <View
                key={insight.id}
                style={[styles.insight, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <Text style={[styles.insightText, { color: theme.ink }]}>{insight.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  stack: {
    gap: spacing.lg,
  },
  spendCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  spendLabel: {
    color: '#D8EDE4',
    fontSize: 14,
    fontWeight: '600',
  },
  spendAmount: {
    color: '#FFFDF8',
    fontSize: 36,
    fontWeight: '800',
  },
  spendMeta: {
    color: '#D8EDE4',
    fontSize: 14,
  },
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  block: {
    gap: spacing.sm,
  },
  insight: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
