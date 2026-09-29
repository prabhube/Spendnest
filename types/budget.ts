export type Budget = {
  id: string;
  user_id: string;
  category_id: string | null;
  month: number;
  year: number;
  amount: number;
};

export type CategoryBudgetProgress = {
  category_id: string;
  category_name: string;
  category_icon: string;
  spent: number;
  budget: number;
  remaining: number;
  percent: number;
};
