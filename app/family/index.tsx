import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { BackLink } from '@/components/BackLink';
import { ChipRow } from '@/components/ChipRow';
import { EmptyState } from '@/components/EmptyState';
import { ErrorText } from '@/components/ErrorText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { RELATIONSHIPS, relationshipLabel } from '@/constants/relationships';
import { radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import {
  createFamilyMember,
  deleteFamilyMember,
  listFamilyMembers,
  updateFamilyMember,
} from '@/services/familyService';
import type { FamilyMember } from '@/types/family';
import { hasErrors, validateFamilyMember, type FieldErrors } from '@/utils/validation';

export default function FamilyScreen() {
  const theme = useTheme();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('spouse');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      setMembers(await listFamilyMembers(profile.id));
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  function startEdit(member: FamilyMember) {
    setEditingId(member.id);
    setName(member.name);
    setRelationship(member.relationship || 'other');
    setErrors({});
    setFormError(null);
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setRelationship('spouse');
    setErrors({});
    setFormError(null);
  }

  async function handleSave() {
    if (!profile) return;
    const editingName = members.find((item) => item.id === editingId)?.name;
    const nextErrors = validateFamilyMember(
      name,
      relationship,
      members.map((item) => item.name),
      editingName
    );
    setErrors(nextErrors);
    setFormError(null);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateFamilyMember(profile.id, editingId, { name, relationship });
      } else {
        await createFamilyMember(profile.id, { name, relationship });
      }
      resetForm();
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save this member.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(member: FamilyMember) {
    if (members.length <= 1) {
      Alert.alert('Keep one member', 'SpendNest needs at least one family member.');
      return;
    }
    Alert.alert('Remove this member?', member.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!profile) return;
          try {
            await deleteFamilyMember(profile.id, member.id);
            if (editingId === member.id) resetForm();
            await reload();
          } catch (err) {
            Alert.alert('Could not delete', err instanceof Error ? err.message : 'Try again.');
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <BackLink />
      <Text style={[styles.title, { color: theme.ink }]}>Family members</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Tap a person to edit. They will appear when you add an expense.
      </Text>

      {loading ? (
        <ActivityIndicator color={theme.forest} />
      ) : (
        <View style={styles.stack}>
          {members.length === 0 ? (
            <EmptyState
              icon="👨‍👩‍👧‍👦"
              title="No family members yet"
              subtitle="Add the people who share this household."
            />
          ) : (
            members.map((member) => {
              const selected = editingId === member.id;
              return (
                <Pressable
                  key={member.id}
                  onPress={() => startEdit(member)}
                  style={[
                    styles.row,
                    {
                      backgroundColor: selected ? theme.sage : theme.card,
                      borderColor: selected ? theme.forest : theme.border,
                    },
                  ]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: theme.ink }]}>{member.name}</Text>
                    <Text style={{ color: theme.muted }}>{relationshipLabel(member.relationship)}</Text>
                  </View>
                  <Pressable onPress={() => confirmDelete(member)} hitSlop={12}>
                    <Text style={{ color: theme.danger, fontWeight: '700' }}>✕</Text>
                  </Pressable>
                </Pressable>
              );
            })
          )}

          <Text style={[styles.section, { color: theme.ink }]}>
            {editingId ? 'Edit member' : '+ Add family member'}
          </Text>
          <TextField
            label="Name"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setErrors((current) => ({ ...current, name: '' }));
            }}
            placeholder="Ananya"
            error={errors.name}
          />
          <Text style={[styles.label, { color: errors.relationship ? theme.danger : theme.muted }]}>
            Relationship
          </Text>
          <ChipRow
            value={relationship}
            onChange={(id) => {
              setRelationship(id);
              setErrors((current) => ({ ...current, relationship: '' }));
            }}
            options={RELATIONSHIPS.map((item) => ({
              id: item,
              label: relationshipLabel(item),
            }))}
          />
          <ErrorText message={errors.relationship} />
          <ErrorText message={formError} />
          <PrimaryButton
            label={saving ? 'Saving…' : editingId ? 'Save changes' : 'Add member'}
            onPress={handleSave}
            disabled={saving}
          />
          {editingId ? (
            <PrimaryButton label="Cancel edit" variant="ghost" onPress={resetForm} />
          ) : null}
        </View>
      )}
    </Screen>
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
    lineHeight: 22,
  },
  stack: {
    gap: spacing.md,
  },
  row: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginTop: spacing.sm,
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
