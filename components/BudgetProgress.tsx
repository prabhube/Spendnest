import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';

type BudgetProgressProps = {
  spent: number;
  budget: number;
  compact?: boolean;
};

export function BudgetProgress({ spent, budget, compact = false }: BudgetProgressProps) {
  const theme = useTheme();
  const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const remaining = budget - spent;
  const over = remaining < 0;
  const fill = over ? theme.danger : percent >= 80 ? theme.gold : theme.leaf;

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: theme.sage }]}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: fill }]} />
      </View>
      {!compact ? (
        <Text style={[styles.caption, { color: over ? theme.danger : theme.muted }]}>
          {over
            ? `${formatCurrency(Math.abs(remaining))} over budget`
            : `${formatCurrency(remaining)} remaining`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  caption: {
    fontSize: 13,
  },
});
