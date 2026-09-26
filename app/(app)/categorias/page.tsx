import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/category-manager";
import { getCategories, getSession } from "@/lib/queries";

export default async function CategoriasPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const categories = await getCategories();

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
        <p className="mt-1 text-sm text-muted">Solo las que usas. Sin complicaciones.</p>
      </section>
      <CategoryManager categories={categories} />
    </>
  );
}
