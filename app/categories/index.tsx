import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { BackLink } from '@/components/BackLink';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { createCategory, listCategories } from '@/services/categoryService';
import type { Category } from '@/types/category';

export default function CategoriesScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✨');
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      setCategories(await listCategories(profile.id));
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  async function handleAdd() {
    if (!profile || !name.trim()) {
      Alert.alert('Name required', 'Give the category a short name.');
      return;
    }
    setSaving(true);
    try {
      await createCategory(profile.id, { name, icon });
      setName('');
      await reload();
    } catch (err) {
      Alert.alert('Could not add category', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <BackLink />
      {loading ? (
        <ActivityIndicator color={theme.forest} />
      ) : (
        <View style={styles.stack}>
          {categories.map((category) => (
            <View
              key={category.id}
              style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={styles.icon}>{category.icon}</Text>
              <Text style={[styles.name, { color: theme.ink }]}>{category.name}</Text>
              {category.is_default ? (
                <Text style={{ color: theme.muted, fontSize: 12 }}>Default</Text>
              ) : (
                <Text style={{ color: theme.leaf, fontSize: 12 }}>Custom</Text>
              )}
            </View>
          ))}

          <Text style={[styles.section, { color: theme.ink }]}>Create custom category</Text>
          <TextField label="Icon" value={icon} onChangeText={setIcon} placeholder="✨" />
          <TextField label="Name" value={name} onChangeText={setName} placeholder="Pets" />
          <PrimaryButton label={saving ? 'Adding…' : 'Add category'} onPress={handleAdd} disabled={saving} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
  },
  row: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    fontSize: 22,
    width: 32,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginTop: spacing.lg,
    fontSize: 18,
    fontWeight: '800',
  },
});
