import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';

type PaymentCardProps = {
  icon: string;
  title: string;
  amount: number;
  dueDate: string;
};

export function PaymentCard({ icon, title, amount, dueDate }: PaymentCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
      <Text style={[styles.amount, { color: theme.ink }]}>{formatCurrency(amount)}</Text>
      <Text style={[styles.date, { color: theme.muted }]}>{formatDisplayDate(dueDate)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  icon: {
    fontSize: 20,
    width: 28,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    fontSize: 13,
    minWidth: 72,
    textAlign: 'right',
  },
});
