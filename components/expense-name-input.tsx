"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Input, Label, TextField } from "@heroui/react";
import { getExpenseNameSuggestionsAction } from "@/actions/expenses";
import { useLang } from "@/components/language";
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
  name?: string;
  isRequired?: boolean;
  maxLength?: number;
}) {
  const { lang, t } = useLang();
  const datalistId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = propValue !== undefined;
  const currentVal = isControlled ? propValue : internalValue;

  const [fetchedSuggestions, setFetchedSuggestions] = useState<ExpenseSuggestion[]>([]);

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

  // Combinar sugerencias del usuario con las por defecto para que siempre haya buenas opciones
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

  // Chips visibles: si el usuario escribe, filtra por coincidencia; si no, muestra las más frecuentes
  const visibleChips = useMemo(() => {
    const q = norm(currentVal.trim());
    if (!q) {
      return allSuggestions.slice(0, 8);
    }
    const matches = allSuggestions.filter((s) => norm(s.name).includes(q));
    return matches.slice(0, 8);
  }, [allSuggestions, currentVal]);

  function handleInputChange(nextVal: string) {
    if (!isControlled) setInternalValue(nextVal);
    propOnChange?.(nextVal);
  }

  function handleSelect(item: ExpenseSuggestion) {
    if (!isControlled) setInternalValue(item.name);
    propOnChange?.(item.name);
    onSelectSuggestion?.(item);
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 w-full">
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
          list={datalistId}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
        />
      </TextField>

      {visibleChips.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider shrink-0 mr-0.5 select-none">
            {t.expense.suggestions}:
          </span>
          {visibleChips.map((item, idx) => {
            const cat = item.categoryId ? categoryMap.get(item.categoryId) : undefined;
            const isSelected = norm(currentVal.trim()) === norm(item.name.trim());
            return (
              <button
                key={`${item.name}-${idx}`}
                type="button"
                onClick={() => handleSelect(item)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "border-accent bg-accent text-accent-foreground font-semibold shadow-xs"
                    : "border-border/70 bg-default/50 hover:bg-default active:scale-95 text-foreground"
                }`}
              >
                <span>{item.name}</span>
                {cat && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] ${
                      isSelected ? "text-accent-foreground/80" : "text-muted"
                    }`}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <datalist id={datalistId}>
        {allSuggestions.map((s, idx) => (
          <option key={`${s.name}-${idx}`} value={s.name} />
        ))}
      </datalist>
    </div>
  );
}
