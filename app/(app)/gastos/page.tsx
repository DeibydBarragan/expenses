import { redirect } from "next/navigation";
import { FadeIn } from "@/components/animated";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { getCategories, getProfile, getRecentExpenses, getSession } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n/server";

export default async function GastosPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const { lang, t } = await getDictionary();
  const profile = await getProfile(user.id);
  const [expenses, categories] = await Promise.all([getRecentExpenses(60), getCategories()]);

  return (
    <>
      <FadeIn>
        <section>
          <h1 className="text-balance text-2xl font-semibold tracking-tight">{t.nav.expenses}</h1>
          <p className="mt-1 text-sm text-muted">{t.list.allSub}</p>
        </section>
      </FadeIn>
      <ExpenseForm categories={categories} currency={profile?.currency ?? "COP"} />
      <ExpenseList expenses={expenses} currency={profile?.currency ?? "COP"} lang={lang} t={t} />
    </>
  );
}
