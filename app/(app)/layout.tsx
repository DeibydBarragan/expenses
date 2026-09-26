import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { MotionProvider } from "@/components/animated";
import { LanguageProvider } from "@/components/language";
import { signOut } from "@/actions/auth";
import { getProfile, getSession } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const { lang, t } = await getDictionary();
  const profile = await getProfile(user.id);

  return (
    <LanguageProvider lang={lang}>
      <MotionProvider>
        <div className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-accent-foreground"
        >
          {t.nav.skip}
        </a>
        <AppNav name={profile?.name ?? user.email} onSignOut={signOut} />
        <main id="main-content" className="mx-auto max-w-xl px-5 py-6 pb-16 flex flex-col gap-5">
          {children}
        </main>
        </div>
      </MotionProvider>
    </LanguageProvider>
  );
}
