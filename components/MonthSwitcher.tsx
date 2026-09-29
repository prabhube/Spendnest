import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';
import { monthLabel, shiftMonth, type YearMonth } from '@/utils/dates';

type MonthSwitcherProps = {
  value: YearMonth;
  onChange: (next: YearMonth) => void;
};

export function MonthSwitcher({ value, onChange }: MonthSwitcherProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(shiftMonth(value, -1))}
        style={[styles.chevron, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.chevronText, { color: theme.ink }]}>‹</Text>
      </Pressable>
      <Text style={[styles.label, { color: theme.ink }]}>{monthLabel(value)}</Text>
      <Pressable
        onPress={() => onChange(shiftMonth(value, 1))}
        style={[styles.chevron, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.chevronText, { color: theme.ink }]}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 22,
    marginTop: -2,
  },
});
