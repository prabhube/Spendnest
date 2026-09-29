import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/theme';

export function BackLink({ label = 'Back' }: { label?: string }) {
  const theme = useTheme();
  return (
    <Pressable onPress={() => router.back()} style={styles.row}>
      <Text style={[styles.label, { color: theme.leaf }]}>‹ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
