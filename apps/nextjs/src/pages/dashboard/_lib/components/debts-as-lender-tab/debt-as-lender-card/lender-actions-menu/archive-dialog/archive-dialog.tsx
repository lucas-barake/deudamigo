import React from "react";
import toast from "react-hot-toast";
import { handleMutationError } from "$/lib/utils/handle-mutation-error";
import { Dialog } from "$/components/ui/dialog";
import { AlertTriangle, BadgeCheck } from "lucide-react";
import { Button } from "$/components/ui/button";
import { useTimer } from "react-timer-hook";
import { DateTime } from "luxon";
import { contracts, type GetLenderDebtsInput, type GetLenderDebtsResult } from "@deudamigo/ts-rest";
import { api } from "$/lib/configs/react-query-client";
import { queryClient } from "$/pages/_app.page";

type Props = {
  debt: GetLenderDebtsResult["debts"][number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queryVariables: GetLenderDebtsInput;
};

const ArchiveDialog: React.FC<Props> = ({ debt, open, onOpenChange, queryVariables }) => {
  const timer = useTimer({
    autoStart: true,
    expiryTimestamp: DateTime.now().plus({ millisecond: 3500 }).toJSDate(),
  });
  const archiveMutation = api.debts.archive.useMutation();

  async function handleArchive(): Promise<void> {
    await toast.promise(
      archiveMutation.mutateAsync({
        params: {
          id: debt.id,
        },
        body: null,
      }),
      {
        loading: "Archivando deuda...",
        success: "Deuda archivada",
        error: handleMutationError,
      }
    );
    void queryClient.invalidateQueries([contracts.debts.getLenderDebts, queryVariables]);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          timer.restart(DateTime.now().plus({ millisecond: 3500 }).toJSDate());
        }
        onOpenChange(newOpen);
      }}>
      <Dialog.Content destructive>
        <Dialog.Header>
          <Dialog.Title className="flex items-center justify-center gap-2 sm:justify-start">
            <AlertTriangle className="text-destructive h-6 w-6" />
            Finalizar deuda
          </Dialog.Title>
          <Dialog.Description>
            Al finalizar la deuda, se considerará completada y permanecerá inactiva de forma
            permanente. No podrás realizar cambios ni transacciones relacionadas con esta deuda,
            pero aún podrás verla. Esta acción no se puede deshacer.
          </Dialog.Description>

          <Dialog.Footer>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                void handleArchive();
              }}
              loading={archiveMutation.isLoading}
              disabled={timer.isRunning}>
              <BadgeCheck className="mr-1.5 h-4 w-4" />
              {timer.isRunning ? `Espera ${timer.seconds}s` : "Concluir"}
            </Button>

            <Dialog.Trigger asChild>
              <Button variant="secondary" size="sm">
                Cancelar
              </Button>
            </Dialog.Trigger>
          </Dialog.Footer>
        </Dialog.Header>
      </Dialog.Content>
    </Dialog>
  );
};

export default ArchiveDialog;
