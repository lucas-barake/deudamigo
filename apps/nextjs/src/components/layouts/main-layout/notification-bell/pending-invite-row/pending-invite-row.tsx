import React from "react";
import { cn } from "$/lib/utils/cn";
import { Check, EyeIcon, X } from "lucide-react";
import { Popover } from "$/components/ui/popover";
import { Button } from "$/components/ui/button";
import { Separator } from "$/components/ui/separator";
import { useRouter } from "next/router";
import { Pages } from "$/lib/enums/pages";
import { SubscriptionsDialog } from "$/components/common/subscriptions-dialog";

type Props = {};

const PendingInviteRow: React.FC<Props> = ({}) => {
  const router = useRouter();
  const [showSubscribeDialog, setShowSubscribeDialog] = React.useState(false);

  return (
    <React.Fragment>
      <SubscriptionsDialog
        open={showSubscribeDialog}
        onOpenChange={setShowSubscribeDialog}
        reachedFreeLimit
      />

      <div className={cn("flex w-full items-center justify-between gap-1 self-stretch text-base")}>
        <div className="flex flex-col gap-2.5 font-medium sm:flex-row sm:items-center">
          <span>User te invitó a:</span>

          <Popover>
            <Popover.Trigger asChild>
              <Button variant="outline" size="sm" className="self-start">
                <EyeIcon className="mr-2 h-4 w-4" />
                <span className="max-w-[100px] truncate xs:max-w-[175px]">Debt Name</span>
              </Button>
            </Popover.Trigger>

            <Popover.Content>
              <div className="flex flex-col gap-1.5 p-2">
                <span className="font-medium">Debt Name</span>
                <span className="text-sm">Debt Description if Exists</span>
                <Separator />
              </div>
            </Popover.Content>
          </Popover>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border-2 border-success-text p-0.5 text-success-text hover:bg-success/10"
            onClick={() => {
              // if (freePlanLimit.reachedMonthlyLimit) {
              //   setShowSubscribeDialog(true);
              //   return;
              // }

              // void toast.promise(
              //   acceptMutation.mutateAsync({
              //     debtId: invite.debt.id,
              //   }),
              //   {
              //     loading: "Aceptando invitación...",
              //     success: "Invitación aceptada",
              //     error: handleToastError,
              //   }
              // );

              void router.push(Pages.DASHBOARD, {
                query: {
                  group: "shared",
                },
              });
            }}>
            <span className="sr-only">Aceptar invitación</span>
            <Check className="h-6 w-6" />
          </button>

          <button
            type="button"
            className="rounded-full border-2 border-destructive p-0.5 text-destructive hover:bg-destructive/10"
            onClick={() => {
              // void toast.promise(
              //   declineMutation.mutateAsync({
              //     debtId: invite.debt.id,
              //   }),
              //   {
              //     loading: "Rechazando invitación...",
              //     success: "Invitación rechazada",
              //     error: handleToastError,
              //   }
              // );
            }}>
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default PendingInviteRow;
