"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, ListBox, SearchField, Select, TextField } from "@heroui/react";
import { CategoryAutocomplete } from "@/components/category-autocomplete";
import { useLang } from "@/components/language";
import type { Category } from "@/lib/types";

export type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export type ToolbarFilters = {
  q: string;
  /** "all" | "none" (sin categoría) | categoryId */
  cat: string;
  from: string;
  to: string;
  sortKey: SortKey;
};

const DEFAULTS: ToolbarFilters = { q: "", cat: "all", from: "", to: "", sortKey: "date-desc" };

function applyPatch(patch: Partial<ToolbarFilters>) {
  const params = new URLSearchParams(window.location.search);
  if (patch.q !== undefined) {
    params.delete("q");
    if (patch.q.trim()) params.set("q", patch.q.trim());
  }
  if (patch.cat !== undefined) {
    params.delete("cat");
    if (patch.cat !== "all") params.set("cat", patch.cat);
  }
  if (patch.from !== undefined) {
    params.delete("from");
    if (patch.from) params.set("from", patch.from);
  }
  if (patch.to !== undefined) {
    params.delete("to");
    if (patch.to) params.set("to", patch.to);
  }
  if (patch.sortKey !== undefined) {
    params.delete("sort");
    params.delete("dir");
    if (patch.sortKey !== "date-desc") {
      const [sort, dir] = patch.sortKey.split("-");
      params.set("sort", sort);
      params.set("dir", dir);
    }
  }
  // Cualquier cambio de filtro vuelve a la primera página.
  params.delete("page");
  return params.toString() ? `/gastos?${params.toString()}` : "/gastos";
}

export function ExpensesToolbar({
  categories,
  initial,
}: {
  categories: Category[];
  initial: ToolbarFilters;
}) {
  const router = useRouter();
  const { t } = useLang();
  const [query, setQuery] = useState(initial.q);

  // Sincroniza si la URL cambia desde fuera (atrás/adelante, limpiar).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(initial.q);
  }, [initial.q]);

  // Buscador con debounce: evita una navegación por tecla.
  useEffect(() => {
    if (query === initial.q) return;
    const id = setTimeout(() => {
      router.replace(applyPatch({ q: query }), { scroll: false });
    }, 300);
    return () => clearTimeout(id);
  }, [query, initial.q, router]);

  function navigate(patch: Partial<ToolbarFilters>) {
    router.replace(applyPatch(patch), { scroll: false });
  }

  const hasActive =
    initial.q !== "" ||
    initial.cat !== "all" ||
    initial.from !== "" ||
    initial.to !== "" ||
    initial.sortKey !== "date-desc";

  return (
    <div className="flex flex-col gap-2">
      <SearchField
        fullWidth
        variant="secondary"
        value={query}
        onChange={setQuery}
        aria-label={t.filters.searchLabel}
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t.filters.searchPh} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div className="grid grid-cols-2 gap-2">
        <CategoryAutocomplete
          categories={categories}
          label={t.filters.category}
          selectedKey={initial.cat}
          onSelectionChange={(key) => navigate({ cat: key == null ? "all" : String(key) })}
          includeAll
          includeUncategorized
        />

        <Select
          fullWidth
          variant="secondary"
          aria-label={t.filters.sort}
          selectedKey={initial.sortKey}
          onSelectionChange={(key) => navigate({ sortKey: key as SortKey })}
        >
          <Label>{t.filters.sort}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="date-desc" textValue={t.filters.sortDateDesc}>
                {t.filters.sortDateDesc}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="date-asc" textValue={t.filters.sortDateAsc}>
                {t.filters.sortDateAsc}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="amount-desc" textValue={t.filters.sortAmountDesc}>
                {t.filters.sortAmountDesc}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="amount-asc" textValue={t.filters.sortAmountAsc}>
                {t.filters.sortAmountAsc}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>

        <TextField
          fullWidth
          variant="secondary"
          value={initial.from}
          onChange={(v) => navigate({ from: v })}
          aria-label={t.filters.from}
        >
          <Label>{t.filters.from}</Label>
          <Input type="date" />
        </TextField>

        <TextField
          fullWidth
          variant="secondary"
          value={initial.to}
          onChange={(v) => navigate({ to: v })}
          aria-label={t.filters.to}
        >
          <Label>{t.filters.to}</Label>
          <Input type="date" />
        </TextField>
      </div>

      {hasActive && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onPress={() => navigate({ ...DEFAULTS })}>
            {t.filters.clear}
          </Button>
        </div>
      )}
    </div>
  );
}

export { DEFAULTS as EXPENSES_TOOLBAR_DEFAULTS };
