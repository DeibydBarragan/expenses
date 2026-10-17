"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input, Label, TextField } from "@heroui/react";
import { getExpenseNameSuggestionsAction } from "@/actions/expenses";
import { CategoryIcon } from "@/components/category-icon";
import { useLang } from "@/components/language";
import { formatMoney } from "@/lib/currency";
import type { Category, ExpenseSuggestion } from "@/lib/types";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const DEFAULT_SUGGESTIONS_ES: ExpenseSuggestion[] = [
  { name: "Almuerzo" },
  { name: "Café" },
  { name: "Supermercado" },
  { name: "Transporte" },
  { name: "Cena" },
  { name: "Desayuno" },
  { name: "Farmacia" },
  { name: "Gasolina" },
  { name: "Servicios" },
  { name: "Ocio" },
];

const DEFAULT_SUGGESTIONS_EN: ExpenseSuggestion[] = [
  { name: "Lunch" },
  { name: "Coffee" },
  { name: "Groceries" },
  { name: "Transport" },
  { name: "Dinner" },
  { name: "Breakfast" },
  { name: "Pharmacy" },
  { name: "Gas" },
  { name: "Utilities" },
  { name: "Entertainment" },
];

export function ExpenseNameInput({
  label,
  placeholder,
  value: propValue,
  defaultValue = "",
  onChange: propOnChange,
  onSelectSuggestion,
  suggestions: propSuggestions,
  categories = [],
  currency = "COP",
  name = "note",
  isRequired = true,
  maxLength = 80,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  onSelectSuggestion?: (sug: ExpenseSuggestion) => void;
  suggestions?: ExpenseSuggestion[];
  categories?: Category[];
  currency?: string;
  name?: string;
  isRequired?: boolean;
  maxLength?: number;
}) {
  const { lang, t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = propValue !== undefined;
  const currentVal = isControlled ? propValue : internalValue;

  const [fetchedSuggestions, setFetchedSuggestions] = useState<ExpenseSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Cargar sugerencias si no se proporcionaron vía props
  useEffect(() => {
    if (propSuggestions && propSuggestions.length > 0) return;
    let active = true;
    getExpenseNameSuggestionsAction()
      .then((data) => {
        if (active && data && data.length > 0) {
          setFetchedSuggestions(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [propSuggestions]);

  const rawSuggestions = (propSuggestions && propSuggestions.length > 0)
    ? propSuggestions
    : fetchedSuggestions;

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) {
      map.set(c.id, c);
    }
    return map;
  }, [categories]);

  // Combinar sugerencias del usuario con las por defecto
  const allSuggestions = useMemo(() => {
    const defaults = lang === "en" ? DEFAULT_SUGGESTIONS_EN : DEFAULT_SUGGESTIONS_ES;
    const seen = new Set<string>();
    const list: ExpenseSuggestion[] = [];

    for (const s of rawSuggestions) {
      const k = norm(s.name);
      if (!seen.has(k)) {
        seen.add(k);
        list.push(s);
      }
    }

    for (const d of defaults) {
      const k = norm(d.name);
      if (!seen.has(k)) {
        seen.add(k);
        let matchedCatId: string | undefined;
        for (const c of categories) {
          if (norm(c.name).includes(k) || k.includes(norm(c.name))) {
            matchedCatId = c.id;
            break;
          }
        }
        list.push({ ...d, categoryId: matchedCatId });
      }
    }

    return list;
  }, [rawSuggestions, lang, categories]);

  // Se activa el select de sugerencias SOLO cuando lleve al menos 3 letras escritas
  const trimmed = currentVal.trim();
  const hasThreeChars = trimmed.length >= 3;

  const filtered = useMemo(() => {
    if (!hasThreeChars) return [];
    const q = norm(trimmed);
    return allSuggestions.filter((s) => norm(s.name).includes(q)).slice(0, 8);
  }, [allSuggestions, trimmed, hasThreeChars]);

  const showDropdown = isOpen && hasThreeChars && filtered.length > 0;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  function handleInputChange(nextVal: string) {
    if (!isControlled) setInternalValue(nextVal);
    propOnChange?.(nextVal);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  function handleSelect(item: ExpenseSuggestion) {
    if (!isControlled) setInternalValue(item.name);
    propOnChange?.(item.name);
    onSelectSuggestion?.(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) {
      if (e.key === "ArrowDown" && hasThreeChars && filtered.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0 && highlightedIndex < filtered.length) {
      e.preventDefault();
      handleSelect(filtered[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <TextField
        fullWidth
        isRequired={isRequired}
        name={name}
        variant="secondary"
        value={currentVal}
        onChange={handleInputChange}
      >
        <Label>{label}</Label>
        <Input
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => {
            if (hasThreeChars && filtered.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
      </TextField>

      {showDropdown && (
        <div
          role="listbox"
          aria-label={t.expense.suggestions}
          className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-52 overflow-y-auto rounded-xl border border-border bg-content1/95 p-1 shadow-2xl backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {t.expense.suggestions}
          </div>
          <div className="flex flex-col gap-0.5">
            {filtered.map((item, idx) => {
              const cat = item.categoryId ? categoryMap.get(item.categoryId) : undefined;
              const isHighlighted = idx === highlightedIndex;
              return (
                <div
                  key={`${item.name}-${idx}`}
                  role="option"
                  aria-selected={isHighlighted}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                    isHighlighted
                      ? "bg-default text-foreground"
                      : "hover:bg-default/70 text-foreground"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: (cat?.color ?? "#64748B") + "25",
                        color: cat?.color ?? "#64748B",
                      }}
                      title={cat?.name ?? t.list.uncategorized}
                    >
                      <CategoryIcon icon={cat?.icon ?? "other"} size={15} />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{item.name}</span>
                      {cat && (
                        <span className="text-[11px] text-muted truncate">{cat.name}</span>
                      )}
                    </div>
                  </div>

                  {item.amount !== undefined && item.amount > 0 && (
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
                      {formatMoney(item.amount, currency, lang)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
