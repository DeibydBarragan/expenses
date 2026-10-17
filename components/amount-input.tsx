"use client";

import { useState } from "react";
import { Input, Label, TextField } from "@heroui/react";
import { currencyMeta, formatAmountInput } from "@/lib/currency";
import { useLang } from "@/components/language";

function toRawAmount(value: number | string | undefined, zero: boolean): string {
  if (value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(String(value).replace(/,/g, "."));
  if (!Number.isFinite(num)) return "";
  return zero ? String(Math.round(num)) : String(num);
}

export function AmountInput({
  label,
  placeholder,
  currency,
  defaultValue,
  value: propValue,
  onChange: propOnChange,
}: {
  label: string;
  placeholder: string;
  currency: string;
  /** Para edición o autocompletado: monto precargado (number o numeric string de la BD). */
  defaultValue?: number | string;
  value?: number | string;
  onChange?: (raw: string) => void;
}) {
  const { lang } = useLang();
  const zero = currencyMeta(currency).zeroDecimals;
  const initial = propValue !== undefined ? propValue : defaultValue;
  const [display, setDisplay] = useState(() => {
    const raw = toRawAmount(initial, zero);
    return raw === "" ? "" : formatAmountInput(raw, currency, lang);
  });
  const [raw, setRaw] = useState(() => toRawAmount(initial, zero));

  const [prevProp, setPrevProp] = useState(propValue);
  if (propValue !== prevProp) {
    setPrevProp(propValue);
    const nextRaw = toRawAmount(propValue, zero);
    setRaw(nextRaw);
    setDisplay(nextRaw === "" ? "" : formatAmountInput(nextRaw, currency, lang));
  }

  function handleChange(value: string) {
    const cleaned = value.replace(/[^0-9.,]/g, "");
    if (zero) {
      const digits = cleaned.replace(/[.,]/g, "").slice(0, 12);
      setRaw(digits);
      setDisplay(formatAmountInput(digits, currency, lang));
      propOnChange?.(digits);
      return;
    }
    const parts = cleaned.split(/[.,]/);
    let int = parts[0] ?? "";
    let dec: string | undefined;
    if (parts.length > 1) {
      dec = (parts.pop() ?? "").slice(0, 2);
      int = parts.join("");
    }
    int = int.replace(/^0+(?=\d)/, "").slice(0, 12);
    const next = dec !== undefined ? `${int}.${dec}` : int;
    setRaw(next);
    setDisplay(formatAmountInput(next, currency, lang));
    propOnChange?.(next);
  }

  return (
    <>
      <TextField fullWidth isRequired value={display} onChange={handleChange}>
        <Label>{label}</Label>
        <Input placeholder={placeholder} inputMode="decimal" autoComplete="off" />
      </TextField>
      <input type="hidden" name="amount" value={raw} />
    </>
  );
}
