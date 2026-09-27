"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
  toast,
  useOverlayState,
} from "@heroui/react";
import { createCategory, deleteCategory, updateCategory } from "@/actions/categories";
import { Stagger, StaggerItem } from "@/components/animated";
import { CategoryIcon } from "@/components/category-icon";
import { DeleteButton } from "@/components/delete-button";
import { IconPicker } from "@/components/icon-picker";
import { useLang } from "@/components/language";
import type { Category } from "@/lib/types";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const { t } = useLang();
  const [editing, setEditing] = useState<Category | null>(null);
  const editModal = useOverlayState();
  const createModal = useOverlayState();
  const [formKey, setFormKey] = useState(0);

  function openEdit(c: Category) {
    setEditing(c);
    editModal.open();
  }

  return (
    <div className="flex flex-col gap-4">
      <Button fullWidth variant="primary" size="lg" onPress={() => createModal.open()}>
        <Plus size={17} />
        {t.categories.new}
      </Button>

      {categories.length === 0 ? (
        <p className="text-center text-sm text-muted">{t.categories.empty}</p>
      ) : (
        <Stagger
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          key={categories.map((c) => c.id + c.name + c.icon).join(",")}
        >
          {categories.map((c) => (
            <StaggerItem key={c.id}>
              <Card className="h-full">
                <Card.Content className="relative flex h-full flex-col items-center gap-1.5 px-3 py-4 text-center">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: c.color + "40", color: c.color }}
                >
                  <CategoryIcon icon={c.icon} size={19} />
                </span>
                <span className="w-full truncate text-sm font-medium">{c.name}</span>
                <span className="absolute left-1 top-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    aria-label={`${t.categories.edit} ${c.name}`}
                    onPress={() => openEdit(c)}
                  >
                    <Pencil size={13} />
                  </Button>
                </span>
                <span className="absolute right-1 top-1">
                  <DeleteButton
                    action={deleteCategory}
                    id={c.id}
                    title={t.del.titleCategory}
                    message={t.categories.delConfirm(c.name)}
                    cancelLabel={t.del.cancel}
                    confirmLabel={t.del.confirm}
                    ariaLabel={t.categories.delLabel(c.name)}
                  />
                </span>
              </Card.Content>
            </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <Modal state={createModal}>
        <Modal.Backdrop>
          <Modal.Container placement="center">
            <Modal.Dialog className="sm:max-w-[360px]">
              <CreateForm
                key={formKey}
                onDone={() => {
                  createModal.close();
                  setFormKey((k) => k + 1);
                }}
              />
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal state={editModal}>
        <Modal.Backdrop>
          <Modal.Container placement="center">
            <Modal.Dialog className="sm:max-w-[360px]">
              {editing && (
                <EditForm
                  key={editing.id}
                  category={editing}
                  onDone={() => editModal.close()}
                />
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const { t } = useLang();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handle(fd: FormData) {
    startTransition(async () => {
      setError(undefined);
      const res = await createCategory(fd);
      if (res?.error) setError(res.error);
      else {
        toast.success(t.toasts.categorySaved);
        onDone();
      }
    });
  }

  return (
    <>
      <Modal.CloseTrigger />
      <Modal.Header>
        <Modal.Heading>{t.categories.new}</Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <form action={handle} className="flex flex-col gap-3">
          <TextField fullWidth isRequired name="name" autoFocus>
            <Label>{t.categories.name}</Label>
            <Input placeholder={t.categories.newPh} maxLength={30} autoComplete="off" />
          </TextField>
          <IconPicker label={t.categories.icon} />
          {error && (
            <p aria-live="polite" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button fullWidth variant="primary" type="submit" isDisabled={pending}>
            {pending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="current" /> {t.categories.saving}
              </span>
            ) : (
              t.categories.add
            )}
          </Button>
        </form>
      </Modal.Body>
    </>
  );
}

function EditForm({ category, onDone }: { category: Category; onDone: () => void }) {
  const { t } = useLang();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handle(fd: FormData) {
    startTransition(async () => {
      setError(undefined);
      const res = await updateCategory(fd);
      if (res?.error) setError(res.error);
      else {
        toast.success(t.categories.updated);
        onDone();
      }
    });
  }

  return (
    <>
      <Modal.CloseTrigger />
      <Modal.Header>
        <Modal.Heading>
          {t.categories.edit} “{category.name}”
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <form action={handle} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={category.id} />
          <TextField fullWidth isRequired name="name" defaultValue={category.name}>
            <Label>{t.categories.name}</Label>
            <Input maxLength={30} autoComplete="off" />
          </TextField>
          <IconPicker label={t.categories.icon} defaultValue={category.icon} />
          {error && (
            <p aria-live="polite" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button fullWidth variant="primary" type="submit" isDisabled={pending}>
            {pending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="current" /> {t.categories.saving}
              </span>
            ) : (
              t.categories.save
            )}
          </Button>
        </form>
      </Modal.Body>
    </>
  );
}
