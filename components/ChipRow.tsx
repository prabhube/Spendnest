import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

type ChipOption = {
  id: string;
  label: string;
};

type ChipRowProps = {
  options: ChipOption[];
  value?: string | null;
  onChange: (id: string) => void;
};

export function ChipRow({ options, value, onChange }: ChipRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id || option.label}
            onPress={() => onChange(option.id)}
            hitSlop={6}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? theme.forest : theme.card,
                borderColor: selected ? theme.forest : theme.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={[styles.label, { color: selected ? theme.onPrimary : theme.ink }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
