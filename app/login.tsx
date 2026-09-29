import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn, mode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={[styles.brand, { color: theme.forest }]}>SpendNest</Text>
        <Text style={[styles.tagline, { color: theme.muted }]}>
          Manage your home expenses{'\n'}smarter.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@home.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        {error ? <Text style={{ color: theme.danger }}>{error}</Text> : null}
        <PrimaryButton label={busy ? 'Signing in…' : 'LOGIN'} onPress={handleLogin} disabled={busy} />
        <Pressable
          onPress={() =>
            Alert.alert(
              'Forgot password?',
              mode === 'supabase'
                ? 'Password reset will be added when email templates are configured in Supabase.'
                : 'This on-device version stores accounts locally. Create a new one if you forget the password.'
            )
          }>
          <Text style={[styles.link, { color: theme.leaf }]}>Forgot Password?</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={{ color: theme.muted }}>Don&apos;t have an account?</Text>
        <Link href="/register" style={[styles.link, { color: theme.forest }]}>
          Register
        </Link>
        <Text style={[styles.mode, { color: theme.muted }]}>
          {mode === 'local' ? 'On-device mode · add Supabase keys anytime' : 'Connected to Supabase'}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  form: {
    gap: spacing.lg,
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  link: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  mode: {
    marginTop: spacing.lg,
    fontSize: 12,
  },
});
