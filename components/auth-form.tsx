"use client";

import { useState, useTransition } from "react";
import { signIn, signUp, signInWithGoogle } from "@/actions/auth";
import { CURRENCIES } from "@/lib/currency";

export function LoginForm() {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handle(fd: FormData) {
    startTransition(async () => {
      setError(undefined);
      const res = await signIn(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={handle} className="flex flex-col gap-4">
        <div>
          <label className="label" htmlFor="email">Correo</label>
          <input className="input" id="email" name="email" type="email" required placeholder="tu@correo.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input className="input" id="password" name="password" type="password" required placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
      </form>
      <GoogleButton />
    </div>
  );
}

export function RegisterForm() {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handle(fd: FormData) {
    startTransition(async () => {
      setError(undefined);
      const res = await signUp(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={handle} className="flex flex-col gap-4">
        <div>
          <label className="label" htmlFor="name">Nombre</label>
          <input className="input" id="name" name="name" type="text" placeholder="Tu nombre" />
        </div>
        <div>
          <label className="label" htmlFor="email">Correo</label>
          <input className="input" id="email" name="email" type="email" required placeholder="tu@correo.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input className="input" id="password" name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" />
        </div>
        <div>
          <label className="label" htmlFor="currency">Moneda</label>
          <select className="input" id="currency" name="currency" defaultValue="COP">
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-400">Podrás cambiarla después si lo necesitas.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary" disabled={pending}>{pending ? "Creando…" : "Crear cuenta"}</button>
      </form>
      <GoogleButton label="Continuar con Google" />
    </div>
  );
}

function GoogleButton({ label = "Continuar con Google" }: { label?: string }) {
  return (
    <form action={signInWithGoogle}>
      <button className="btn-ghost" type="submit">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z" />
        <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.4 7.5 24 12 24z" />
        <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.5-2.7-.1.1C.5 8.7 0 10.3 0 12s.5 3.3 1.5 4.8l3.7-2.4z" />
        <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.6 1.5 6.8l3.7 2.9c1-2.9 3.7-5 6.8-5z" />
      </svg>
      {label}
      </button>
    </form>
  );
}
