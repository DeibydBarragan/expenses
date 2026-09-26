"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { Button, Modal, Spinner } from "@heroui/react";

export function DeleteButton({
  action,
  id,
  title,
  message,
  cancelLabel,
  confirmLabel,
  ariaLabel,
}: {
  action: (formData: FormData) => void;
  id: string;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  ariaLabel: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Modal>
      <Button variant="ghost" size="sm" isIconOnly aria-label={ariaLabel}>
        <X size={14} />
      </Button>
      <Modal.Backdrop>
        <Modal.Container placement="center">
          <Modal.Dialog className="sm:max-w-[340px]">
            {({ close }) => {
              function handle(fd: FormData) {
                startTransition(async () => {
                  await action(fd);
                  close();
                });
              }
              return (
                <>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>{title}</Modal.Heading>
                  </Modal.Header>
                  <form action={handle}>
                    <input type="hidden" name="id" value={id} />
                    <Modal.Body>
                      <p className="text-sm text-muted">{message}</p>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="secondary">
                        {cancelLabel}
                      </Button>
                      <Button type="submit" variant="danger" isDisabled={pending}>
                        {pending ? <Spinner size="sm" color="current" /> : confirmLabel}
                      </Button>
                    </Modal.Footer>
                  </form>
                </>
              );
            }}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
