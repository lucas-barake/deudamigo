import React from "react";
import { Button } from "$/components/ui/button";
import { DropdownMenu } from "$/components/ui/dropdown-menu";
import { Avatar } from "$/components/ui/avatar";
import { CreditCard, LogOut } from "lucide-react";
import { SubscriptionsDialog } from "$/components/common/subscriptions-dialog";
import { cn } from "$/lib/utils/cn";
import { useSession } from "$/lib/hooks/use-session";

export const ProfileMenu: React.FC = () => {
  const session = useSession();
  const [showSubscriptionsDialog, setShowSubscriptionsDialog] = React.useState(false);

  return (
    <React.Fragment>
      {/*<SubscriptionsDialog*/}
      {/*  open={showSubscriptionsDialog}*/}
      {/*  onOpenChange={setShowSubscriptionsDialog}*/}
      {/*/>*/}

      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              session.user?.activeSubscription &&
                "bg-yellow-500/10 hover:bg-yellow-500/20 dark:bg-yellow-500/5 dark:hover:bg-yellow-500/10"
            )}>
            <Avatar className="h-6 w-6">
              <Avatar.Image src={session.user?.image ?? ""} />

              <Avatar.Fallback className="bg-indigo-200 dark:bg-indigo-800">
                {session.user?.name?.[0] ?? "?"}
              </Avatar.Fallback>
            </Avatar>
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content className="w-56">
          <DropdownMenu.Label>
            {session.user?.name ?? "Usuario"}
            <p className="text-muted-foreground text-xs leading-none">
              {session.user?.email ?? ""}
            </p>
          </DropdownMenu.Label>

          <DropdownMenu.Separator />

          <DropdownMenu.Group>
            <DropdownMenu.Item asChild>
              <button
                type="button"
                onClick={() => {
                  setShowSubscriptionsDialog(true);
                }}
                className="w-full cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Suscripciones</span>
              </button>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <button
                type="button"
                onClick={() => {
                  void session.signOut();
                }}
                className="w-full cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu>
    </React.Fragment>
  );
};
