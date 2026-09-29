import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import type { ExpenseWithDetails } from '@/types/expense';

type ExpenseCardProps = {
  expense: ExpenseWithDetails;
  onPress?: () => void;
};

export function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.sage }]}>
        <Text style={styles.icon}>{expense.category?.icon ?? '📦'}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.ink }]}>
          {expense.category?.name ?? 'Other'}
        </Text>
        <Text style={[styles.meta, { color: theme.muted }]} numberOfLines={1}>
          {expense.description || 'No description'}
        </Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {[expense.payment_method, expense.family_member?.name].filter(Boolean).join(' · ') || '—'}
        </Text>
      </View>
      <Text style={[styles.amount, { color: theme.ink }]}>{formatCurrency(expense.amount)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
