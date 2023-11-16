import React from "react";
import { Popover } from "$/components/ui/popover";
import { Button } from "$/components/ui/button";
import { PaymentStatus } from "@prisma/client";
import { Separator } from "$/components/ui/separator";
import { type GetLenderDebtsInput, type GetLenderDebtsResult } from "@deudamigo/ts-rest";
import DebtCard from "$/pages/dashboard/_lib/components/debt-card";
import LenderActionsMenu from "$/pages/dashboard/_lib/components/debts-as-lender-tab/debt-as-lender-card/lender-actions-menu";

type Props = {
  debt: GetLenderDebtsResult["debts"][number];
  queryVariables: GetLenderDebtsInput;
};

const DebtAsLenderCard: React.FC<Props> = ({ debt, queryVariables }) => {
  const normalizedBorrowers = debt.borrowers.map(({ user }) => user);
  const members = [debt.lender, ...normalizedBorrowers];
  const hasPendingConfirmations = debt.borrowers.some((borrower) =>
    borrower.payments.some(({ status }) => status === PaymentStatus.PENDING_CONFIRMATION)
  );

  return (
    <DebtCard isConcluded={debt.archived !== null}>
      <DebtCard.Header>
        <DebtCard.Title>{debt.name}</DebtCard.Title>

        <DebtCard.AvatarContainer>
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="ghost" className="flex h-10 -space-x-2 px-2">
                {members.map((user) => (
                  <DebtCard.MemberAvatar
                    key={user.id}
                    image={user.image}
                    fallback={
                      user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?"
                    }
                  />
                ))}
              </Button>
            </Popover.Trigger>

            <Popover.Content align="end" className="w-60">
              <div className="flex flex-col gap-2">
                {members.map((user) => (
                  <React.Fragment key={user.id}>
                    <span className="font-bold">
                      {user.name ?? "Sin nombre"} {user.id === debt.lender.id && "(Tú)"}
                    </span>

                    <span className="text-foreground/50 break-all text-sm">{user.email}</span>

                    <Separator className="last:hidden" />
                  </React.Fragment>
                ))}
              </div>
            </Popover.Content>
          </Popover>
        </DebtCard.AvatarContainer>
      </DebtCard.Header>

      <DebtCard.BadgeContainer>
        <DebtCard.AmountBadge amount={debt.amount} currency={debt.currency} />

        <DebtCard.RecurringFrequencyBadge
          recurringFrequency={debt.recurringFrequency}
          duration={debt.duration}
        />
      </DebtCard.BadgeContainer>

      <DebtCard.Description>{debt.description}</DebtCard.Description>

      <DebtCard.Footer>
        <div className="flex flex-col gap-1.5">
          <DebtCard.CreatedAtBadge createdAt={debt.createdAt} />

          <DebtCard.DueDateBadge
            dueDate={debt.dueDate}
            recurringFrequency={debt.recurringFrequency}
            createdAt={debt.createdAt}
            duration={debt.duration}
          />
        </div>

        <LenderActionsMenu
          debt={debt}
          queryVariables={queryVariables}
          hasPendingConfirmations={hasPendingConfirmations}
        />
      </DebtCard.Footer>
    </DebtCard>
  );
};

export default DebtAsLenderCard;
