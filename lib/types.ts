export type Profile = {
  id: string;
  name: string | null;
  currency: string;
  streak_reset_at: string | null;
  show_streak: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Expense = {
  id: string;
  amount: number;
  note: string | null;
  date: string;
  category_id: string | null;
  categories: Category | null;
};
