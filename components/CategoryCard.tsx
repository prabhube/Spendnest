import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';

type CategoryCardProps = {
  icon: string;
  name: string;
  amount: number;
};

export function CategoryCard({ icon, name, amount }: CategoryCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.name, { color: theme.ink }]}>{name}</Text>
      <Text style={[styles.amount, { color: theme.ink }]}>{formatCurrency(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  icon: {
    fontSize: 22,
    width: 32,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
