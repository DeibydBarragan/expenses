"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/inicio", label: "Inicio" },
  { href: "/gastos", label: "Gastos" },
  { href: "/informes", label: "Informes" },
  { href: "/categorias", label: "Categorías" },
];

export function AppNav({ name, onSignOut }: { name?: string | null; onSignOut: () => void }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-[#FAF9F7]/85 border-b border-stone-200">
      <div className="mx-auto max-w-xl px-5 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight">expenses</span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-stone-500 max-w-[120px] truncate">{name}</span>
          <button onClick={() => onSignOut()} className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4">
            Salir
          </button>
        </div>
      </div>
      <nav className="mx-auto max-w-xl px-5 pb-3 flex gap-2">
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm px-3.5 py-1.5 rounded-full transition ${
                active ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-200/60 hover:text-stone-900"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
