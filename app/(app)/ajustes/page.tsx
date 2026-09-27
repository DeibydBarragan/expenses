import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { Card } from "@heroui/react";
import { FadeIn } from "@/components/animated";
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
      <FadeIn>
        <Card>
          <Card.Content className="flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <User size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold">{profile?.name ?? "—"}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </Card.Content>
        </Card>
      </FadeIn>
      <FadeIn delay={0.05}>
        <CurrencySettings current={profile?.currency ?? "COP"} />
      </FadeIn>
    </>
  );
}
