import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { ErrorText } from '@/components/ErrorText';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  prefix?: string;
  error?: string | null;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'sentences',
  prefix,
  error,
}: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: error ? theme.danger : theme.muted }]}>{label}</Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.card,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}>
        {prefix ? <Text style={[styles.prefix, { color: theme.ink }]}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.muted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.input, { color: theme.ink }]}
        />
      </View>
      <ErrorText message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  field: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
});
