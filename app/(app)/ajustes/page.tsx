import { redirect } from "next/navigation";
import { CurrencySettings } from "@/components/currency-settings";
import { getProfile, getSession } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n/server";

export default async function AjustesPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const { t } = await getDictionary();
  const profile = await getProfile(user.id);

  return (
    <>
      <section>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">{t.settings.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.settings.subtitle}</p>
      </section>
      <CurrencySettings current={profile?.currency ?? "COP"} />
    </>
  );
}
