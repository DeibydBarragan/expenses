import { Card, Link as HeroLink } from "@heroui/react";
import { LoginForm } from "@/components/auth-form";
import { LanguageProvider, LanguageToggle } from "@/components/language";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDictionary } from "@/lib/i18n/server";

export default async function LoginPage() {
  const { lang, t } = await getDictionary();
  return (
    <LanguageProvider lang={lang}>
      <main className="relative flex min-h-screen items-center justify-center px-6">
        <div className="absolute right-4 top-4 flex gap-1">
          <LanguageToggle />
          <ThemeToggle labelLight={t.themeToggle.toLight} labelDark={t.themeToggle.toDark} />
        </div>
        <div className="w-full max-w-sm">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted" translate="no">
            expenses
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight">{t.login.title}</h1>
          <p className="mb-6 mt-1 text-sm text-muted">{t.login.subtitle}</p>
          <Card>
            <Card.Content className="flex flex-col gap-4 p-5">
              <LoginForm />
            </Card.Content>
          </Card>
          <p className="mt-6 text-center text-sm text-muted">
            {t.login.noAccount}{" "}
            <HeroLink href="/registro" className="text-sm">
              {t.login.createOne}
            </HeroLink>
          </p>
        </div>
      </main>
    </LanguageProvider>
  );
}
