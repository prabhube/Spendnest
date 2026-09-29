export type FieldErrors = Record<string, string>;

const NAME_PATTERN = /^[\p{L}\s.'-]+$/u;

export function validateFamilyMember(
  name: string,
  relationship: string,
  existingNames: string[],
  editingName?: string
): FieldErrors {
  const errors: FieldErrors = {};
  const trimmed = name.trim();

  if (!trimmed) {
    errors.name = 'Enter the member name.';
  } else if (trimmed.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (trimmed.length > 40) {
    errors.name = 'Name must be 40 characters or less.';
  } else if (!NAME_PATTERN.test(trimmed)) {
    errors.name = 'Use letters, spaces, and hyphens only.';
  } else {
    const duplicate = existingNames.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase() && item.toLowerCase() !== editingName?.toLowerCase()
    );
    if (duplicate) {
      errors.name = 'This family member is already added.';
    }
  }

  if (!relationship.trim()) {
    errors.relationship = 'Select a relationship.';
  }

  return errors;
}

export function validateExpense(input: { amount: string; categoryId: string }): FieldErrors {
  const errors: FieldErrors = {};
  const raw = input.amount.trim().replace(/[₹,\s]/g, '');

  if (!raw) {
    errors.amount = 'Enter the amount.';
  } else if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    errors.amount = 'Enter a valid amount, up to 2 decimal places.';
  } else {
    const amount = Number.parseFloat(raw);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.amount = 'Amount must be greater than 0.';
    } else if (amount > 10_000_000) {
      errors.amount = 'Amount looks too high. Check the value.';
    }
  }

  if (!input.categoryId) {
    errors.category = 'Select a category.';
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
