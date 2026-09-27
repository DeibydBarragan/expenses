"use client";

import { useState, useTransition } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, Card, Input, Label, Modal, Spinner, TextField } from "@heroui/react";
import { deleteAccount } from "@/actions/account";
import { useLang } from "@/components/language";

export function DeleteAccount() {
  const { t } = useLang();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const phrase = t.settings.deletePhrase;
  const match = value.trim().toLowerCase() === phrase.toLowerCase();

  function confirm() {
    if (!match) return;
    startTransition(async () => {
      setError(undefined);
      const res = await deleteAccount();
      if (res?.error) setError(res.error);
    });
  }

  return (
    <Card>
      <Card.Content className="flex items-center gap-3 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-danger/15 text-danger">
          <TriangleAlert size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-danger">{t.settings.deleteTitle}</p>
          <p className="mt-0.5 text-xs text-muted">{t.settings.deleteHint}</p>
        </div>
        <Modal>
          <Button variant="danger" size="sm" className="shrink-0">
            {t.settings.deleteTitle}
          </Button>
          <Modal.Backdrop>
            <Modal.Container placement="center">
              <Modal.Dialog className="sm:max-w-[360px]">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>{t.settings.deleteTitle}</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-3">
                  <p className="text-sm text-muted">{t.settings.deleteHint}</p>
                    <TextField fullWidth value={value} onChange={setValue} aria-label={t.settings.deletePh}>
                      <Label>{t.settings.deleteType(phrase)}</Label>
                      <Input placeholder={t.settings.deletePh} autoComplete="off" />
                    </TextField>
                  {error && (
                    <p aria-live="polite" className="text-sm text-danger">
                      {error}
                    </p>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="secondary">
                    {t.del.cancel}
                  </Button>
                  <Button variant="danger" isDisabled={pending || !match} onPress={confirm}>
                    {pending ? <Spinner size="sm" color="current" /> : t.settings.deleteTitle}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </Card.Content>
    </Card>
  );
}
