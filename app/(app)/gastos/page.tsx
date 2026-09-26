import { redirect } from "next/navigation";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { getCategories, getProfile, getRecentExpenses, getSession } from "@/lib/queries";

export default async function GastosPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  const [expenses, categories] = await Promise.all([getRecentExpenses(60), getCategories()]);

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Gastos</h1>
        <p className="text-sm text-stone-500 mt-1">Todo lo que has registrado, lo más nuevo primero.</p>
      </section>
      <ExpenseForm categories={categories} />
      <ExpenseList expenses={expenses} currency={profile?.currency ?? "COP"} />
    </>
  );
}
