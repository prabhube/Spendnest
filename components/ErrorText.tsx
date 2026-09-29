import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export function ErrorText({ message }: { message?: string | null }) {
  const theme = useTheme();
  if (!message) return null;
  return <Text style={[styles.text, { color: theme.danger }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
