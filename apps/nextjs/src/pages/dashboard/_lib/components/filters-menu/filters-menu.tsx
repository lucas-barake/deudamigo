import React from "react";
import * as LucideIcons from "lucide-react";
import { Button } from "$/components/ui/button";
import { DropdownMenu } from "$/components/ui/dropdown-menu";
import {
  borrowerDebtsStatusOptions,
  type GetBorrowerDebtsInput,
  type GetLenderDebtsInput,
  lenderDebtsStatusOptions,
} from "@deudamigo/ts-rest";

type LenderProps = {
  selectedStatus: GetLenderDebtsInput["status"];
  setSelectedStatus: (status: GetLenderDebtsInput["status"]) => void;
  lender: true;
};
type BorrowerProps = {
  selectedStatus: GetBorrowerDebtsInput["status"];
  setSelectedStatus: (status: GetBorrowerDebtsInput["status"]) => void;
  lender: false;
};
type Props = LenderProps | BorrowerProps;

const FiltersMenu: React.FC<Props> = ({ selectedStatus, setSelectedStatus, lender }) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">
          <LucideIcons.Settings2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">
            {lenderDebtsStatusOptions.find((status) => status.value === selectedStatus)?.label}
          </span>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end" className="w-[185px]">
        <DropdownMenu.Label>Filtrar por Estado</DropdownMenu.Label>
        <DropdownMenu.Separator />

        {lender
          ? lenderDebtsStatusOptions.map((status) => (
              <DropdownMenu.CheckboxItem
                key={status.value}
                onClick={() => {
                  setSelectedStatus(status.value);
                }}
                checked={status.value === selectedStatus}
                className="flex items-center gap-2">
                {status.label}
              </DropdownMenu.CheckboxItem>
            ))
          : borrowerDebtsStatusOptions.map((status) => (
              <DropdownMenu.CheckboxItem
                key={status.value}
                onClick={() => {
                  setSelectedStatus(status.value);
                }}
                checked={status.value === selectedStatus}
                className="flex items-center gap-2">
                {status.label}
              </DropdownMenu.CheckboxItem>
            ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export default FiltersMenu;
