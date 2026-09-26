import { Card, Link as HeroLink } from "@heroui/react";
import { RegisterForm } from "@/components/auth-form";

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">expenses</p>
        <h1 className="text-2xl font-semibold tracking-tight">Crea tu cuenta</h1>
        <p className="mb-6 mt-1 text-sm text-muted">Empieza a registrar en menos de un minuto.</p>
        <Card>
          <Card.Content className="flex flex-col gap-4 p-5">
            <RegisterForm />
          </Card.Content>
        </Card>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <HeroLink href="/login" className="text-sm">
            Entrar
          </HeroLink>
        </p>
      </div>
    </main>
  );
}
