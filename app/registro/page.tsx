import Link from "next/link";
import { RegisterForm } from "@/components/auth-form";

export default function RegistroPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">expenses</p>
        <h1 className="text-2xl font-semibold tracking-tight">Crea tu cuenta</h1>
        <p className="text-sm text-stone-500 mt-1 mb-6">Empieza a registrar en menos de un minuto.</p>
        <RegisterForm />
        <p className="mt-6 text-sm text-stone-500 text-center">
          ¿Ya tienes cuenta? <Link href="/login" className="text-stone-900 underline underline-offset-4">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
