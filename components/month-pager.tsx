"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

export function MonthPager({
  prevHref,
  nextHref,
  children,
}: {
  prevHref: string;
  nextHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <>
      <Button variant="ghost" size="sm" isIconOnly aria-label="Mes anterior" onPress={() => router.push(prevHref)}>
        ←
      </Button>
      {children}
      <Button variant="ghost" size="sm" isIconOnly aria-label="Mes siguiente" onPress={() => router.push(nextHref)}>
        →
      </Button>
    </>
  );
}
