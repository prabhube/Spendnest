import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, scroll = true, padded = true, style }: ScreenProps) {
  const theme = useTheme();
  const contentStyle = [styles.content, padded && styles.padded, style];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, ...contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
