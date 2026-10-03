import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { Card } from "@heroui/react";
import { FadeIn } from "@/components/animated";
import { CurrencySettings } from "@/components/currency-settings";
import { DeleteAccount } from "@/components/delete-account";
import { PasswordSettings } from "@/components/password-settings";
import { ResetStreak } from "@/components/reset-streak";
import { StreakCard } from "@/components/streak-card";
import { StreakVisibility } from "@/components/streak-visibility";
import { getProfile, getSession, getStreakActivity } from "@/lib/queries";
import { computeStreak } from "@/lib/streak";
import { getTimeZone, todayISOInTZ } from "@/lib/time";
import { getDictionary } from "@/lib/i18n/server";

export default async function AjustesPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const { lang, t } = await getDictionary();
  const profile = await getProfile(user.id);
  const streak = computeStreak(
    await getStreakActivity(),
    todayISOInTZ(await getTimeZone()),
    profile?.streak_reset_at ?? null
  );
  const providers = (user.app_metadata?.providers as string[] | undefined) ?? [];
  const hasPassword = providers.includes("email");

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
      {profile?.show_streak !== false && (
        <FadeIn delay={0.05}>
          <StreakCard streak={streak} t={t} lang={lang} showLastDay />
        </FadeIn>
      )}
      <FadeIn delay={0.08}>
        <StreakVisibility current={profile?.show_streak ?? true} />
      </FadeIn>
      <FadeIn delay={0.1}>
        <CurrencySettings current={profile?.currency ?? "COP"} />
      </FadeIn>
      <FadeIn delay={0.12}>
        <PasswordSettings hasPassword={hasPassword} />
      </FadeIn>
      <FadeIn delay={0.15}>
        <ResetStreak />
      </FadeIn>
      <FadeIn delay={0.2}>
        <DeleteAccount />
      </FadeIn>
    </>
  );
}
