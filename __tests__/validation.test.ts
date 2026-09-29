import { hasErrors, validateExpense, validateFamilyMember } from '@/utils/validation';

describe('validateFamilyMember', () => {
  it('requires a name', () => {
    expect(validateFamilyMember('', 'spouse', [])).toEqual({
      name: 'Enter the member name.',
    });
  });

  it('rejects a name that is too short', () => {
    expect(validateFamilyMember('A', 'child', []).name).toBe('Name must be at least 2 characters.');
  });

  it('rejects duplicate names', () => {
    expect(validateFamilyMember('Ananya', 'spouse', ['Ananya']).name).toBe(
      'This family member is already added.'
    );
  });

  it('allows saving the same name while editing', () => {
    expect(hasErrors(validateFamilyMember('Ananya', 'spouse', ['Ananya'], 'Ananya'))).toBe(false);
  });

  it('requires a relationship', () => {
    expect(validateFamilyMember('Ananya', '', []).relationship).toBe('Select a relationship.');
  });
});

describe('validateExpense', () => {
  it('requires amount and category on submit', () => {
    expect(validateExpense({ amount: '', categoryId: '' })).toEqual({
      amount: 'Enter the amount.',
      category: 'Select a category.',
    });
  });

  it('rejects zero and invalid amounts', () => {
    expect(validateExpense({ amount: '0', categoryId: 'cat-1' }).amount).toBe(
      'Amount must be greater than 0.'
    );
    expect(validateExpense({ amount: '12.345', categoryId: 'cat-1' }).amount).toBe(
      'Enter a valid amount, up to 2 decimal places.'
    );
  });

  it('accepts a valid expense', () => {
    expect(hasErrors(validateExpense({ amount: '850', categoryId: 'cat-1' }))).toBe(false);
  });
});
