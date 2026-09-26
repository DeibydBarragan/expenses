import { Card, Link as HeroLink } from "@heroui/react";
import { LoginForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">expenses</p>
        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
        <p className="mb-6 mt-1 text-sm text-muted">Qué bueno verte por aquí.</p>
        <Card>
          <Card.Content className="flex flex-col gap-4 p-5">
            <LoginForm />
          </Card.Content>
        </Card>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Sin cuenta?{" "}
          <HeroLink href="/registro" className="text-sm">
            Crear una
          </HeroLink>
        </p>
      </div>
    </main>
  );
}
