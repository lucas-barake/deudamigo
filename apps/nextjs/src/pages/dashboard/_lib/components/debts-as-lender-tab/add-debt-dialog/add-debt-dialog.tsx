import React from "react";
import { Button } from "$/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog } from "$/components/ui/dialog";
import { Tabs } from "$/components/ui/tabs";
import { SubscriptionsDialog } from "$/components/common/subscriptions-dialog";
import { useTabs } from "$/lib/hooks/use-tabs";
import {
  type AddDebtTab,
  addDebtTabs,
} from "$/pages/dashboard/_lib/components/debts-as-lender-tab/add-debt-dialog/(component-lib)/add-debt-tabs";
import GeneralInfoForm from "$/pages/dashboard/_lib/components/debts-as-lender-tab/add-debt-dialog/general-info-form";
import MembersForm from "$/pages/dashboard/_lib/components/debts-as-lender-tab/add-debt-dialog/members-form";
import {
  type CreateDebtInput,
  defaultCreateDebtInput,
  type GetLenderDebtsInput,
} from "@deudamigo/api-contracts";

type Props = {
  queryVariables: GetLenderDebtsInput;
};

const AddDebtDialog: React.FC<Props> = ({ queryVariables }) => {
  const [formData, setFormData] = React.useState<CreateDebtInput>(defaultCreateDebtInput);
  const [open, setOpen] = React.useState(false);
  const [openSubscriptionsDialog, setOpenSubscriptionsDialog] = React.useState(false);
  const [selectedTab, tabSetters] = useTabs(addDebtTabs);

  return (
    <React.Fragment>
      <SubscriptionsDialog
        open={openSubscriptionsDialog}
        onOpenChange={setOpenSubscriptionsDialog}
        reachedFreeLimit
      />

      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) {
            tabSetters.reset();
          }
        }}>
        <Button
          className="flex items-center gap-1"
          onClick={() => {
            setOpen(true);
            tabSetters.set(addDebtTabs[0]);
          }}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline-flex">Agregar</span>
          Deuda
        </Button>

        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {selectedTab === "general-info-form" ? "Agregar Deuda" : "Invitar Deudores"}
            </Dialog.Title>

            <Dialog.Description>
              {selectedTab === "general-info-form" ? (
                <React.Fragment>
                  ⚠️ Una vez hayas creada la deuda, no podrás cambiar esta información.
                </React.Fragment>
              ) : (
                <React.Fragment>
                  ⚠️ Podrás agregar más deudores luego de crear la deuda, pero no podrás eliminar a
                  los deudores una vez hayan aceptado la invitación.
                </React.Fragment>
              )}
            </Dialog.Description>
          </Dialog.Header>

          <Tabs
            value={selectedTab}
            onValueChange={(v) => {
              tabSetters.set(v as AddDebtTab);
            }}>
            <Tabs.Content value={addDebtTabs[0]}>
              <GeneralInfoForm
                tabSetters={tabSetters}
                formData={formData}
                setFormData={setFormData}
              />
            </Tabs.Content>

            <Tabs.Content value={addDebtTabs[1]}>
              <MembersForm
                tabSetters={tabSetters}
                setOpen={setOpen}
                queryVariables={queryVariables}
                formData={formData}
                setFormData={setFormData}
              />
            </Tabs.Content>
          </Tabs>
        </Dialog.Content>
      </Dialog>
    </React.Fragment>
  );
};

export default AddDebtDialog;
