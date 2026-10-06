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

export type ExpenseSortBy = "date" | "amount" | "created_at";
export type ExpenseSortDir = "asc" | "desc";

export type ExpensesFilter = {
  /** Texto libre: coincide con `note` (ilike, insensible a mayúsculas). */
  search?: string;
  /**
   * Filtro por categoría:
   * - `undefined` = todas
   * - `null` = solo sin categoría
   * - `string` = solo esa categoría
   */
  categoryId?: string | null;
  /** ISO `YYYY-MM-DD` inclusivo. */
  from?: string;
  /** ISO `YYYY-MM-DD` inclusivo. */
  to?: string;
  sortBy?: ExpenseSortBy;
  sortDir?: ExpenseSortDir;
  /** 1-indexed. */
  page?: number;
  pageSize?: number;
};

export type ExpensesPage = {
  data: Expense[];
  count: number;
  totalPages: number;
  page: number;
  pageSize: number;
};
