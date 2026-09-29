import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { updateMonthlyIncome } from '@/services/authService';
import { exportExpenses } from '@/services/exportService';
import { loadSampleData } from '@/services/sampleData';
import { afterUi } from '@/utils/afterUi';
import { parseAmount } from '@/utils/currency';

export default function MoreScreen() {
  const theme = useTheme();
  const { profile, signOut, setProfile, mode } = useAuth();
  const [income, setIncome] = useState(profile?.monthly_income ? String(profile.monthly_income) : '');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  async function saveIncome() {
    if (!profile) return;
    setBusy(true);
    setStatus(null);
    try {
      const updated = await updateMonthlyIncome(profile.id, parseAmount(income));
      setProfile(updated);
      setStatus({ type: 'ok', text: 'Monthly income saved.' });
    } catch (err) {
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'Could not save income.' });
    } finally {
      setBusy(false);
    }
  }

  function seed() {
    if (!profile) return;
    Alert.alert(
      'Load sample data?',
      'This fills the current month with example expenses, budgets, and bills so you can explore Home.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: () => afterUi(() => void runSeed()),
        },
      ]
    );
  }

  async function runSeed() {
    if (!profile) return;
    setBusy(true);
    setStatus({ type: 'ok', text: 'Loading sample data…' });
    try {
      const updated = await loadSampleData(profile.id, profile.name);
      setProfile(updated);
      setIncome(String(updated.monthly_income));
      setStatus({ type: 'ok', text: 'Sample data loaded. Opening Home…' });
      afterUi(() => router.replace('/(tabs)/home' as Href), 400);
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not load sample data.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function runExport(range: 'month' | 'all') {
    if (!profile) return;
    setBusy(true);
    setStatus(null);
    try {
      const count = await exportExpenses(profile.id, range);
      setStatus({
        type: 'ok',
        text: `Exported ${count} expense${count === 1 ? '' : 's'}. Pick an app to save or share the CSV.`,
      });
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not export expenses.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.ink }]}>More</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Settings, categories, recurring bills, and household extras.
      </Text>

      {status ? (
        <View
          style={[
            styles.status,
            {
              backgroundColor: status.type === 'ok' ? theme.sage : theme.dangerSoft,
              borderColor: status.type === 'ok' ? theme.leaf : theme.danger,
            },
          ]}>
          <Text style={{ color: status.type === 'ok' ? theme.forest : theme.danger, fontWeight: '600' }}>
            {status.text}
          </Text>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.muted }]}>Signed in as</Text>
        <Text style={[styles.value, { color: theme.ink }]}>{profile?.name}</Text>
        <Text style={{ color: theme.muted }}>{profile?.email}</Text>
        <Text style={[styles.mode, { color: theme.leaf }]}>
          {mode === 'local' ? 'On-device storage' : 'Supabase connected'}
        </Text>
      </View>

      <TextField
        label="Monthly income"
        prefix="₹"
        value={income}
        onChangeText={setIncome}
        keyboardType="decimal-pad"
        placeholder="85000"
      />
      <PrimaryButton label={busy ? 'Working…' : 'Save income'} onPress={saveIncome} disabled={busy} />

      <MenuLink label="Categories" onPress={() => router.push('/categories' as Href)} />
      <MenuLink label="Recurring bills" onPress={() => router.push('/recurring' as Href)} />
      <MenuLink label="Family members" onPress={() => router.push('/family' as Href)} />

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.value, { color: theme.ink }]}>Export</Text>
        <Text style={{ color: theme.muted, marginBottom: spacing.sm }}>
          Share a CSV of your expenses. On Android, choose Drive, Gmail, or Files to save it.
        </Text>
        <PrimaryButton
          label={busy ? 'Exporting…' : 'Export this month'}
          onPress={() => afterUi(() => void runExport('month'))}
          disabled={busy}
        />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton
          label="Export all expenses"
          variant="ghost"
          onPress={() => afterUi(() => void runExport('all'))}
          disabled={busy}
        />
      </View>

      <PrimaryButton
        label={busy ? 'Loading…' : 'Load sample data'}
        onPress={seed}
        variant="ghost"
        disabled={busy}
      />
      <PrimaryButton
        label="Log out"
        variant="danger"
        onPress={() => {
          Alert.alert('Log out?', 'You can sign back in with the same account.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Log out',
              style: 'destructive',
              onPress: () => signOut(),
            },
          ]);
        }}
      />
    </Screen>
  );
}

function MenuLink({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.link, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.linkText, { color: theme.ink }]}>{label}</Text>
      <Text style={{ color: theme.muted }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  status: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 4,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  mode: {
    marginTop: spacing.sm,
    fontWeight: '700',
  },
  link: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
