"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button, Tabs } from "@heroui/react";
import { LanguageToggle, useLang } from "@/components/language";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppNav({ name, onSignOut }: { name?: string | null; onSignOut: () => void }) {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();

  const LINKS = [
    { href: "/inicio", label: t.nav.home },
    { href: "/gastos", label: t.nav.expenses },
    { href: "/informes", label: t.nav.reports },
    { href: "/categorias", label: t.nav.categories },
    { href: "/ajustes", label: t.nav.settings },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-3">
        <span className="text-sm font-semibold tracking-tight" translate="no">
          expenses
        </span>
        <div className="flex items-center gap-1">
          <span className="hidden max-w-[120px] truncate text-xs text-muted sm:block">{name}</span>
          <LanguageToggle />
          <ThemeToggle labelLight={t.themeToggle.toLight} labelDark={t.themeToggle.toDark} />
          <Button variant="ghost" size="sm" onPress={() => onSignOut()}>
            {t.nav.signOut}
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-xl overflow-x-auto px-5 pb-3">
        <Tabs selectedKey={pathname} onSelectionChange={(key) => router.push(String(key))}>
          <Tabs.List aria-label={t.nav.navLabel}>
            {LINKS.map((l) => (
              <Tabs.Tab key={l.href} id={l.href}>
                {l.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </div>
    </header>
  );
}
