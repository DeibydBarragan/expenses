import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/category-manager";
import { getCategories, getSession } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n/server";

export default async function CategoriasPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const { t } = await getDictionary();
  const categories = await getCategories();

  return (
    <>
      <section>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">{t.categories.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.categories.subtitle}</p>
      </section>
      <CategoryManager categories={categories} />
    </>
  );
}
