import Link from "next/link";
import { LoginForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">expenses</p>
        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
        <p className="text-sm text-stone-500 mt-1 mb-6">Qué bueno verte por aquí.</p>
        <LoginForm />
        <p className="mt-6 text-sm text-stone-500 text-center">
          ¿Sin cuenta? <Link href="/registro" className="text-stone-900 underline underline-offset-4">Crear una</Link>
        </p>
      </div>
    </main>
  );
}
