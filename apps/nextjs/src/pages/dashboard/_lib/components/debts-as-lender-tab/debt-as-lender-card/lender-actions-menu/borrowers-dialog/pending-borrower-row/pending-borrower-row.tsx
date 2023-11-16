import React from "react";
import { Avatar } from "$/components/ui/avatar";
import { api } from "$/lib/utils/api";
import toast from "react-hot-toast";
import { handleMutationError } from "$/lib/utils/handle-mutation-error";
import { Button } from "$/components/ui/button";
import { UserMinus } from "lucide-react";
import { type GetDebtBorrowersAndPendingBorrowersResult } from "@deudamigo/api-contracts";

type Props = {
  pendingBorrower: GetDebtBorrowersAndPendingBorrowersResult["pendingBorrowers"][number];
  debtId: string;
};

const PendingBorrowerRow: React.FC<Props> = ({ pendingBorrower, debtId }) => {
  const apiContext = api.useUtils();
  const removeInvite = api.debtInvites.removeInvite.useMutation();
  async function handleRemoveInvite(): Promise<void> {
    await toast.promise(
      removeInvite.mutateAsync({
        debtId,
        inviteeEmail: pendingBorrower.inviteeEmail,
      }),
      {
        loading: "Eliminando invitación...",
        success: "Invitación eliminada",
        error: handleMutationError,
      }
    );

    apiContext.debts.getDebtBorrowersAndPendingBorrowers.setData(
      {
        debtId,
      },
      (cachedData) => {
        if (!cachedData) return cachedData;

        return {
          ...cachedData,
          pendingBorrowers: cachedData.pendingBorrowers.filter(
            (b) => b.inviteeEmail !== pendingBorrower.inviteeEmail
          ),
        };
      }
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar>
          <Avatar.Fallback>{pendingBorrower.inviteeEmail?.[0] ?? "?"}</Avatar.Fallback>
        </Avatar>

        <span className="text-foreground xs:max-w-[200px] max-w-[150px] truncate sm:max-w-[250px]">
          {pendingBorrower.inviteeEmail}
        </span>
      </div>

      <Button
        size="sm"
        variant="destructive"
        onClick={() => {
          void handleRemoveInvite();
        }}>
        <UserMinus className="h-5 w-5 sm:mr-1.5" />
        <span className="sr-only sm:not-sr-only">Eliminar</span>
      </Button>
    </div>
  );
};

export default PendingBorrowerRow;
