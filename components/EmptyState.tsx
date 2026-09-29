import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

type EmptyStateProps = {
  icon: string;
  title: string;
  subtitle: string;
};

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
