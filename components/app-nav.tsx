"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button, Tabs } from "@heroui/react";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/inicio", label: "Inicio" },
  { href: "/gastos", label: "Gastos" },
  { href: "/informes", label: "Informes" },
  { href: "/categorias", label: "Categorías" },
];

export function AppNav({ name, onSignOut }: { name?: string | null; onSignOut: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-3">
        <span className="text-sm font-semibold tracking-tight">expenses</span>
        <div className="flex items-center gap-1">
          <span className="hidden max-w-[120px] truncate text-xs text-muted sm:block">{name}</span>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onPress={() => onSignOut()}>
            Salir
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-xl px-5 pb-3">
        <Tabs selectedKey={pathname} onSelectionChange={(key) => router.push(String(key))}>
          <Tabs.List aria-label="Navegación">
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
