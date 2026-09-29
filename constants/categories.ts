export type DefaultCategory = {
  name: string;
  icon: string;
  type: 'expense';
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Groceries', icon: '🛒', type: 'expense' },
  { name: 'Rent', icon: '🏠', type: 'expense' },
  { name: 'Electricity', icon: '⚡', type: 'expense' },
  { name: 'Water', icon: '💧', type: 'expense' },
  { name: 'Medical', icon: '🏥', type: 'expense' },
  { name: 'Mobile', icon: '📱', type: 'expense' },
  { name: 'Internet', icon: '🌐', type: 'expense' },
  { name: 'Fuel', icon: '⛽', type: 'expense' },
  { name: 'Food', icon: '🍔', type: 'expense' },
  { name: 'Shopping', icon: '🛍️', type: 'expense' },
  { name: 'Education', icon: '🎓', type: 'expense' },
  { name: 'Child', icon: '👶', type: 'expense' },
  { name: 'Transport', icon: '🚗', type: 'expense' },
  { name: 'EMI', icon: '💳', type: 'expense' },
  { name: 'Entertainment', icon: '🎬', type: 'expense' },
  { name: 'Other', icon: '📦', type: 'expense' },
];
