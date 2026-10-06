import { redirect } from "next/navigation";
import { FadeIn } from "@/components/animated";
import { CategoryManager } from "@/components/category-manager";
import { getCategories, getProfile, getSession } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n/server";

export default async function CategoriasPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const { t } = await getDictionary();
  const [categories, profile] = await Promise.all([
    getCategories(),
    getProfile(user.id),
  ]);

  return (
    <>
      <FadeIn>
        <section>
          <h1 className="text-balance text-2xl font-semibold tracking-tight">{t.categories.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.categories.subtitle}</p>
        </section>
      </FadeIn>
      <CategoryManager
        categories={categories}
        currency={profile?.currency ?? "COP"}
      />
    </>
  );
}
