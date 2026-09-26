"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

export function LandingCtas() {
  const router = useRouter();
  return (
    <div className="mt-8 flex flex-col gap-3">
      <Button fullWidth variant="primary" size="lg" onPress={() => router.push("/registro")}>
        Empezar
      </Button>
      <Button fullWidth variant="outline" size="lg" onPress={() => router.push("/login")}>
        Ya tengo cuenta
      </Button>
    </div>
  );
}
