import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Name, email, and a password of at least 6 characters are required.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signUp(name, email, password);
      router.replace('/(tabs)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={[styles.brand, { color: theme.forest }]}>Create account</Text>
        <Text style={[styles.tagline, { color: theme.muted }]}>
          Start tracking household spending in under a minute.
        </Text>
      </View>
      <View style={styles.form}>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Prabhu" />
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
          placeholder="At least 6 characters"
          secureTextEntry
        />
        {error ? <Text style={{ color: theme.danger }}>{error}</Text> : null}
        <PrimaryButton
          label={busy ? 'Creating…' : 'REGISTER'}
          onPress={handleRegister}
          disabled={busy}
        />
      </View>
      <View style={styles.footer}>
        <Text style={{ color: theme.muted }}>Already have an account?</Text>
        <Link href="/login" style={[styles.link, { color: theme.forest }]}>
          Login
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 16,
    lineHeight: 22,
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
  },
});
