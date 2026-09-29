import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';

type SummaryCardProps = {
  income: number;
  expenses: number;
  savings: number;
};

export function SummaryCard({ income, expenses, savings }: SummaryCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Row label="Income" value={income} color={theme.ink} />
      <Row label="Expenses" value={expenses} color={theme.ink} />
      <Row label="Savings" value={savings} color={savings >= 0 ? theme.leaf : theme.danger} />
    </View>
  );
}

function Row({ label, value, color }: { label: string; value: number; color: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.value, { color }]}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
});
