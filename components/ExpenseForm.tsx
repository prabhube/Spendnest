import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChipRow } from '@/components/ChipRow';
import { ErrorText } from '@/components/ErrorText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextField } from '@/components/TextField';
import { PAYMENT_METHODS } from '@/constants/payments';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { Category } from '@/types/category';
import type { FamilyMember } from '@/types/family';
import type { CreateExpenseInput } from '@/types/expense';
import { parseAmount } from '@/utils/currency';
import { formatDisplayDate, parseISODate, toISODate } from '@/utils/dates';
import { hasErrors, validateExpense, type FieldErrors } from '@/utils/validation';

export type ExpenseFormValues = CreateExpenseInput & {
  recurring?: boolean;
};

type ExpenseFormProps = {
  categories: Category[];
  members: FamilyMember[];
  initial?: Partial<ExpenseFormValues>;
  submitLabel: string;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
  showRecurring?: boolean;
};

export function ExpenseForm({
  categories,
  members,
  initial,
  submitLabel,
  onSubmit,
  showRecurring = false,
}: ExpenseFormProps) {
  const theme = useTheme();
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [date, setDate] = useState(initial?.expense_date ?? toISODate(new Date()));
  const [payment, setPayment] = useState(initial?.payment_method ?? 'UPI');
  const [memberId, setMemberId] = useState(initial?.family_member_id ?? members[0]?.id ?? '');
  const [recurring, setRecurring] = useState(Boolean(initial?.recurring));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  function shiftDate(delta: number) {
    const next = parseISODate(date);
    next.setDate(next.getDate() + delta);
    setDate(toISODate(next));
  }

  async function handleSave() {
    const nextErrors = validateExpense({ amount, categoryId });
    setErrors(nextErrors);
    setFormError(null);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    try {
      await onSubmit({
        amount: parseAmount(amount),
        category_id: categoryId,
        description,
        expense_date: date,
        payment_method: payment,
        family_member_id: memberId || null,
        recurring,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save expense.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <TextField
        label="Amount"
        prefix="₹"
        value={amount}
        onChangeText={(value) => {
          setAmount(value);
          setErrors((current) => ({ ...current, amount: '' }));
        }}
        placeholder="850"
        keyboardType="decimal-pad"
        error={errors.amount}
      />

      <View style={styles.block}>
        <Text style={[styles.label, { color: errors.category ? theme.danger : theme.muted }]}>
          Category
        </Text>
        <ChipRow
          value={categoryId}
          onChange={(id) => {
            setCategoryId(id);
            setErrors((current) => ({ ...current, category: '' }));
          }}
          options={categories.map((category) => ({
            id: category.id,
            label: `${category.icon} ${category.name}`,
          }))}
        />
        <ErrorText message={errors.category} />
      </View>

      <TextField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Rice + vegetables"
      />

      <View style={styles.block}>
        <Text style={[styles.label, { color: theme.muted }]}>Date</Text>
        <View style={styles.dateRow}>
          <Pressable
            onPress={() => shiftDate(-1)}
            style={[styles.dateBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Text style={{ color: theme.ink }}>‹</Text>
          </Pressable>
          <Text style={[styles.dateLabel, { color: theme.ink }]}>{formatDisplayDate(date)}</Text>
          <Pressable
            onPress={() => shiftDate(1)}
            style={[styles.dateBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Text style={{ color: theme.ink }}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.block}>
        <Text style={[styles.label, { color: theme.muted }]}>Payment</Text>
        <ChipRow
          value={payment ?? undefined}
          onChange={setPayment}
          options={PAYMENT_METHODS.map((method) => ({ id: method, label: method }))}
        />
      </View>

      {members.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.label, { color: theme.muted }]}>Family Member</Text>
          <ChipRow
            value={memberId || '__none__'}
            onChange={(id) => setMemberId(id === '__none__' ? '' : id)}
            options={[
              { id: '__none__', label: 'Anyone' },
              ...members.map((member) => ({ id: member.id, label: member.name })),
            ]}
          />
        </View>
      ) : (
        <Text style={[styles.label, { color: theme.muted }]}>
          Add family members from More to assign expenses.
        </Text>
      )}

      {showRecurring ? (
        <Pressable onPress={() => setRecurring((value) => !value)} style={styles.checkRow}>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: theme.forest,
                backgroundColor: recurring ? theme.forest : 'transparent',
              },
            ]}>
            {recurring ? <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>✓</Text> : null}
          </View>
          <Text style={[styles.checkLabel, { color: theme.ink }]}>Recurring</Text>
        </Pressable>
      ) : null}

      <ErrorText message={formError} />

      <PrimaryButton
        label={saving ? 'Saving…' : submitLabel}
        onPress={handleSave}
        disabled={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  block: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
