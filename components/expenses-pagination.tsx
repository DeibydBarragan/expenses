"use client";

import { useRouter } from "next/navigation";
import { Pagination } from "@heroui/react";
import { useLang } from "@/components/language";

/** Ventana de páginas: 1 … p-1, p, p+1 … N (máx ~7 botones). */
function pageWindow(page: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set(
    [1, 2, page - 1, page, page + 1, total - 1, total].filter((p) => p >= 1 && p <= total)
  );
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("ellipsis");
    out.push(p);
    prev = p;
  }
  return out;
}

export function ExpensesPagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  /** Filtros activos ya saneados (sin `page`); se preservan al navegar. */
  params: Record<string, string>;
}) {
  const router = useRouter();
  const { t } = useLang();

  if (totalPages <= 1) return null;

  function go(p: number) {
    const sp = new URLSearchParams(params);
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    const s = sp.toString();
    router.push(s ? `/gastos?${s}` : "/gastos", { scroll: false });
  }

  return (
    <Pagination>
      <Pagination.Content>
        {page > 1 && (
          <Pagination.Item>
            <Pagination.Previous onPress={() => go(page - 1)} aria-label={t.filters.prev}>
              <Pagination.PreviousIcon />
            </Pagination.Previous>
          </Pagination.Item>
        )}
        {pageWindow(page, totalPages).map((item, i) =>
          item === "ellipsis" ? (
            <Pagination.Item key={`gap-${i}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={item}>
              <Pagination.Link
                isActive={item === page}
                aria-label={String(item)}
                onPress={item === page ? undefined : () => go(item)}
              >
                {item}
              </Pagination.Link>
            </Pagination.Item>
          )
        )}
        {page < totalPages && (
          <Pagination.Item>
            <Pagination.Next onPress={() => go(page + 1)} aria-label={t.filters.next}>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        )}
      </Pagination.Content>
      <Pagination.Summary className="text-sm text-muted tabular-nums">
        {page} / {totalPages}
      </Pagination.Summary>
    </Pagination>
  );
}
