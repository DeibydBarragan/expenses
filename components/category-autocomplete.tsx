"use client";

import { useState } from "react";
import { Label, ListBox, SearchField, Select } from "@heroui/react";
import { CategoryIcon } from "@/components/category-icon";
import { useLang } from "@/components/language";
import type { Category } from "@/lib/types";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Selector de categoría con búsqueda integrada.
 * Misma API que `Select` (`name`, `isRequired`,
 * `selectedKey`/`onSelectionChange`), así que sirve tanto para
 * formularios ( expense-form ) como para filtros controlados.
 * El filtrado es local: filtra las categorías ya cargadas, sin requests.
 */
export function CategoryAutocomplete({
  categories,
  label,
  placeholder,
  name,
  isRequired,
  defaultSelectedKey,
  selectedKey,
  onSelectionChange,
  includeAll,
  includeUncategorized,
}: {
  categories: Category[];
  label: string;
  placeholder?: string;
  name?: string;
  isRequired?: boolean;
  defaultSelectedKey?: string;
  selectedKey?: string | null;
  onSelectionChange?: (key: string | number | null) => void;
  /** Añade opción "Todas" (filtros). */
  includeAll?: boolean;
  /** Añade opción "Sin categoría" (filtros). */
  includeUncategorized?: boolean;
}) {
  const { t } = useLang();
  const [q, setQ] = useState("");

  const matches = (text: string) => (q.trim() === "" ? true : norm(text).includes(norm(q.trim())));

  return (
    <Select
      fullWidth
      variant="secondary"
      placeholder={placeholder}
      name={name}
      isRequired={isRequired}
      defaultSelectedKey={defaultSelectedKey}
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
      onOpenChange={(open) => {
        if (!open) setQ("");
      }}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover shouldFlip={false}>
        <div className="px-1.5 pt-1.5">
          <SearchField aria-label={t.filters.searchCategories} value={q} onChange={setQ}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={t.filters.searchCategories} />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>
        <ListBox>
          {includeAll && matches(t.filters.all) && (
            <ListBox.Item id="all" textValue={t.filters.all}>
              {t.filters.all}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
          {includeUncategorized && matches(t.list.uncategorized) && (
            <ListBox.Item id="none" textValue={t.list.uncategorized}>
              {t.list.uncategorized}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
          {categories
            .filter((c) => matches(c.name))
            .map((c) => (
              <ListBox.Item key={c.id} id={c.id} textValue={c.name}>
                <span className="flex items-center gap-2">
                  <CategoryIcon icon={c.icon} size={15} />
                  {c.name}
                </span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
