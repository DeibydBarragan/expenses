"use client";

import { useState } from "react";
import { Input, Label, TextField } from "@heroui/react";
import { currencyMeta, formatAmountInput } from "@/lib/currency";
import { useLang } from "@/components/language";

export function AmountInput({
  label,
  placeholder,
  currency,
}: {
  label: string;
  placeholder: string;
  currency: string;
}) {
  const { lang } = useLang();
  const [display, setDisplay] = useState("");
  const [raw, setRaw] = useState("");
  const zero = currencyMeta(currency).zeroDecimals;

  function handleChange(value: string) {
    const cleaned = value.replace(/[^0-9.,]/g, "");
    if (zero) {
      const digits = cleaned.replace(/[.,]/g, "").slice(0, 12);
      setRaw(digits);
      setDisplay(formatAmountInput(digits, currency, lang));
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
