export type Category = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  type: 'expense' | 'income';
  is_default: boolean;
};
