"use client";

import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { Button, Card, Modal, Spinner, toast } from "@heroui/react";
import { resetStreak } from "@/actions/streak";
import { useLang } from "@/components/language";

export function ResetStreak() {
  const { t } = useLang();
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <Card.Content className="flex items-center gap-3 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{t.streak.reset}</p>
          <p className="mt-0.5 text-xs text-muted">{t.streak.resetHint}</p>
        </div>
        <Modal>
          <Button variant="outline" size="sm" className="shrink-0">
            <RotateCcw size={15} />
            {t.streak.reset}
          </Button>
          <Modal.Backdrop>
            <Modal.Container placement="center">
              <Modal.Dialog className="sm:max-w-[340px]">
                {({ close }) => {
                  function confirm() {
                    startTransition(async () => {
                      const res = await resetStreak();
                      if (res?.reset) {
                        toast.success(res.reset);
                        close();
                      }
                    });
                  }
                  return (
                    <>
                      <Modal.CloseTrigger />
                      <Modal.Header>
                        <Modal.Heading>{t.streak.reset}</Modal.Heading>
                      </Modal.Header>
                      <Modal.Body>
                        <p className="text-sm text-muted">{t.streak.resetMsg}</p>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button slot="close" variant="secondary">
                          {t.del.cancel}
                        </Button>
                        <Button variant="danger" isDisabled={pending} onPress={confirm}>
                          {pending ? (
                            <Spinner size="sm" color="current" />
                          ) : (
                            t.streak.reset
                          )}
                        </Button>
                      </Modal.Footer>
                    </>
                  );
                }}
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </Card.Content>
    </Card>
  );
}
