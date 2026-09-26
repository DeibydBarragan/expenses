import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/inicio");

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4">expenses</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Gastos con calma.
        </h1>
        <p className="mt-3 text-stone-500 text-[15px] leading-relaxed">
          Registra lo esencial de cada día. Sin ruido, sin excesos. Solo lo necesario.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/registro" className="btn-primary text-center no-underline">
            Empezar
          </Link>
          <Link href="/login" className="btn-ghost text-center no-underline">
            Ya tengo cuenta
          </Link>
        </div>
        <p className="mt-8 text-xs text-stone-400">Hecho para el día a día · COP, MXN, EUR y más</p>
      </div>
    </main>
  );
}
