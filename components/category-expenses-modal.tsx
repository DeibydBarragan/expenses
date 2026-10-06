"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  Input,
  Label,
  ListBox,
  Modal,
  SearchField,
  Select,
  Spinner,
  TextField,
  useOverlayState,
} from "@heroui/react";
import { deleteExpense, fetchCategoryExpensesPage } from "@/actions/expenses";
import { CategoryIcon } from "@/components/category-icon";
import { DeleteButton } from "@/components/delete-button";
import { ExpenseEditModal } from "@/components/expense-edit-modal";
import type { SortKey } from "@/components/expenses-toolbar";
import { useLang } from "@/components/language";
import { formatDateISO, formatMonthYear, formatMoney } from "@/lib/currency";
import type { Lang } from "@/lib/i18n/dictionaries";
import type { Category, Expense } from "@/lib/types";

export type ModalRow = {
  id: string | null;
  name: string;
  color: string;
  icon: string;
};

export type CategoryScope =
  | { kind: "month"; year: number; month: number }
  | { kind: "range" };

const MODAL_PAGE_SIZE = 10;

function monthBounds(year: number, month: number): { from: string; to: string } {
  const mm = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${lastDay}` };
}

export function CategoryExpensesModal({
  state,
  row,
  scope,
  categories,
  currency,
  lang,
  emptyText,
}: {
  state: ReturnType<typeof useOverlayState>;
  row: ModalRow | null;
  scope: CategoryScope;
  categories: Category[];
  currency: string;
  lang: Lang;
  emptyText?: string;
}) {
  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="center">
          <Modal.Dialog className="sm:max-w-[420px]">
            <Modal.CloseTrigger />
            {row && (
              <DetailBody
                key={row.id ?? "__uncategorized"}
                row={row}
                scope={scope}
                categories={categories}
                currency={currency}
                lang={lang}
                emptyText={emptyText}
              />
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function DetailBody({
  row,
  scope,
  categories,
  currency,
  lang,
  emptyText,
}: {
  row: ModalRow;
  scope: CategoryScope;
  categories: Category[];
  currency: string;
  lang: Lang;
  emptyText?: string;
}) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date-desc");
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [nonce, setNonce] = useState(0);
  const [data, setData] = useState<Expense[] | null>(null);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const bounds = scope.kind === "month" ? monthBounds(scope.year, scope.month) : null;
  const effFrom = bounds ? bounds.from : from || undefined;
  const effTo = bounds ? bounds.to : to || undefined;

  useEffect(() => {
    let cancelled = false;
    const [sortBy, sortDir] = sortKey.split("-") as ["date" | "amount", "asc" | "desc"];
    const id = setTimeout(() => {
      void fetchCategoryExpensesPage({
        categoryId: row.id,
        search: q.trim() || undefined,
        from: effFrom,
        to: effTo,
        sortBy,
        sortDir,
        page,
        pageSize: MODAL_PAGE_SIZE,
      }).then((res) => {
        if (cancelled) return;
        if ("error" in res) {
          setData([]);
          setCount(0);
          setTotalPages(0);
          return;
        }
        if (res.data.length === 0 && page > 1 && res.count > 0) {
          setPage(page - 1);
          return;
        }
        setData(res.data);
        setCount(res.count);
        setTotalPages(res.totalPages);
      });
    }, q ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [row.id, q, sortKey, page, effFrom, effTo, nonce]);

  function reload() {
    setNonce((n) => n + 1);
  }

  const hasActive =
    q !== "" || sortKey !== "date-desc" || from !== "" || to !== "";

  function clearAll() {
    setQ("");
    setSortKey("date-desc");
    setFrom("");
    setTo("");
    setPage(1);
  }

  const scopeLabel =
    scope.kind === "month"
      ? formatMonthYear(scope.year, scope.month, lang)
      : from || to
        ? `${from ? formatDateISO(from, lang) : "…"} → ${to ? formatDateISO(to, lang) : "…"}`
        : t.filters.allTime;

  return (
    <>
      <Modal.Header>
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: row.color + "40", color: row.color }}
          >
            <CategoryIcon icon={row.icon} size={19} />
          </span>
          <div className="min-w-0">
            <Modal.Heading className="truncate">{row.name}</Modal.Heading>
            <p className="text-sm text-muted" aria-live="polite">
              {scopeLabel}
              {data !== null && ` · ${t.reports.count(count)}`}
            </p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <SearchField
            fullWidth
            variant="secondary"
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            aria-label={t.filters.searchLabel}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={t.filters.searchPh} />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <div className="grid grid-cols-2 gap-2">
            {scope.kind === "range" && (
              <>
                <TextField
                  fullWidth
                  variant="secondary"
                  value={from}
                  onChange={(v) => {
                    setFrom(v);
                    setPage(1);
                  }}
                  aria-label={t.filters.from}
                >
                  <Label>{t.filters.from}</Label>
                  <Input type="date" />
                </TextField>
                <TextField
                  fullWidth
                  variant="secondary"
                  value={to}
                  onChange={(v) => {
                    setTo(v);
                    setPage(1);
                  }}
                  aria-label={t.filters.to}
                >
                  <Label>{t.filters.to}</Label>
                  <Input type="date" />
                </TextField>
              </>
            )}
            <div className="col-span-2">
              <Select
                fullWidth
                variant="secondary"
                aria-label={t.filters.sort}
                selectedKey={sortKey}
                onSelectionChange={(key) => {
                  setSortKey(key as SortKey);
                  setPage(1);
                }}
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
            </div>
          </div>
        </div>

        {hasActive && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onPress={clearAll}>
              {t.filters.clear}
            </Button>
          </div>
        )}

        {data === null ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" color="current" aria-label={t.filters.searchLabel} />
          </div>
        ) : data.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">{emptyText ?? t.reports.empty}</p>
        ) : (
          <ul className="flex max-h-[40vh] flex-col gap-2 overflow-y-auto pr-0.5">
            {data.map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-2xl bg-default px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {e.note || e.categories?.name || t.list.fallback}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{formatDateISO(e.date, lang)}</p>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {formatMoney(Number(e.amount), currency, lang)}
                </span>
                <ExpenseEditModal
                  key={`${e.id}-${e.date}-${e.amount}-${e.category_id}-${e.note}`}
                  expense={e}
                  categories={categories}
                  currency={currency}
                  onSaved={reload}
                />
                <DeleteButton
                  action={deleteExpense}
                  id={e.id}
                  title={t.del.titleExpense}
                  message={t.list.delConfirm}
                  cancelLabel={t.del.cancel}
                  confirmLabel={t.del.confirm}
                  ariaLabel={t.list.delLabel}
                  onDone={reload}
                />
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              aria-label={t.filters.prev}
              isDisabled={page <= 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-muted tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              aria-label={t.filters.next}
              isDisabled={page >= totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </Modal.Body>
    </>
  );
}
