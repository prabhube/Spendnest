import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  const theme = useTheme();
  const backgroundColor =
    variant === 'primary' ? theme.forest : variant === 'danger' ? theme.danger : 'transparent';
  const color = variant === 'ghost' ? theme.forest : theme.onPrimary;
  const borderColor = variant === 'ghost' ? theme.forest : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderWidth: 1.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
