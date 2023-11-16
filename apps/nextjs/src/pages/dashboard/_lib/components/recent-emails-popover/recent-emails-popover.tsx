import React from "react";
import { Popover } from "$/components/ui/popover";
import { Button } from "$/components/ui/button";
import { CheckIcon, Users2 } from "lucide-react";
import { Command } from "$/components/ui/command";
import { FieldError } from "$/components/ui/form/field-error";
import { ScrollArea } from "$/components/ui/scroll-area";
import { Separator } from "$/components/ui/separator";
import { Loader } from "$/components/ui/loader";
import { useWindowDimensions } from "$/lib/hooks/use-window-dimensions";

type Props = {
  onSelect(email: string): void;
  currentEmails: string[];
  disabled?: boolean;
  disableSelected?: boolean;
};

const RecentEmailsPopover: React.FC<Props> = ({
  onSelect,
  currentEmails,
  disabled = false,
  disableSelected = false,
}) => {
  // const recentEmailsQuery = api.user.getRecentEmails.useQuery(undefined, {
  //   staleTime: TimeInMs.TenSeconds,
  //   cacheTime: TimeInMs.TenSeconds,
  //   refetchOnWindowFocus: true,
  //   refetchOnMount: true,
  // });
  // const recentEmails: string[] = [];

  const [open, setOpen] = React.useState(false);
  const windowDimensions = useWindowDimensions();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <Users2 className="mr-1 h-5 w-5" />
          Recientes
        </Button>
      </Popover.Trigger>

      <Popover.Content
        noPortal
        className="p-0"
        align={
          windowDimensions.width === null
            ? "center"
            : windowDimensions.width < 640
            ? "end"
            : "center"
        }>
        {/*{recentEmailsQuery.isFetching ? (*/}
        {/*  <div className="flex items-center justify-center p-2">*/}
        {/*    <Loader />*/}
        {/*  </div>*/}
        {/*) : recentEmailsQuery.isError ? (*/}
        {/*  <FieldError className="p-2 text-center">{recentEmailsQuery.error.message}</FieldError>*/}
        {/*) : recentEmails.length === 0 ? (*/}
        {/*  <p className="text-muted-foreground p-2 text-center">*/}
        {/*    Empieza a invitar a tus amigos para que aparezcan aquí*/}
        {/*  </p>*/}
        {/*) : (*/}
        {/*  <React.Fragment>*/}
        {/*    <p className="p-2 text-center text-sm">*/}
        {/*      Los últimos 5 correos electrónicos a los que has invitado*/}
        {/*    </p>*/}

        {/*    <Separator />*/}

        {/*    <Command>*/}
        {/*      <Command.Input placeholder="Buscar..." />*/}
        {/*      <Command.Empty>No se encontraron usuarios</Command.Empty>*/}

        {/*      <Command.Group>*/}
        {/*        <ScrollArea className="h-72 overflow-y-scroll">*/}
        {/*          {recentEmails.map((email) => {*/}
        {/*            const isSelected = currentEmails.includes(email);*/}
        {/*            return (*/}
        {/*              <Command.Item*/}
        {/*                key={email}*/}
        {/*                value={email}*/}
        {/*                onSelect={(e) => {*/}
        {/*                  onSelect(e);*/}
        {/*                  setOpen(false);*/}
        {/*                }}*/}
        {/*                disabled={isSelected && disableSelected}>*/}
        {/*                {isSelected && <CheckIcon className="mr-1.5 h-4 w-4" />}*/}
        {/*                {email}*/}
        {/*              </Command.Item>*/}
        {/*            );*/}
        {/*          })}*/}
        {/*        </ScrollArea>*/}
        {/*      </Command.Group>*/}
        {/*    </Command>*/}
        {/*  </React.Fragment>*/}
        {/*)}*/}
      </Popover.Content>
    </Popover>
  );
};

export default RecentEmailsPopover;
