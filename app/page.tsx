import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingCtas } from "@/components/landing-ctas";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/inicio");

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">expenses</p>
        <h1 className="text-3xl font-semibold tracking-tight">Gastos con calma.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Registra lo esencial de cada día. Sin ruido, sin excesos. Solo lo necesario.
        </p>
        <LandingCtas />
        <p className="mt-8 text-xs text-muted">Hecho para el día a día · COP, MXN, EUR y más</p>
      </div>
    </main>
  );
}
