import { type NextPageWithLayout } from "$/pages/_app.page";
import { useCustomRouter } from "$/lib/hooks/use-custom-router";
import { MainLayout } from "src/components/layouts/main-layout";
import { Tabs } from "$/components/ui/tabs";
import { type TabList, useTabs } from "$/lib/hooks/use-tabs";
import { createManyUnion } from "$/lib/utils/zod/create-union-schema";
import React from "react";
import DebtsAsLenderTab from "$/pages/dashboard/_lib/components/debts-as-lender-tab";

const tabs = ["as-lender", "as-borrower", "my-expenses"] as const satisfies TabList;
type Tab = (typeof tabs)[number];
const tabIdsSchema = createManyUnion(tabs as typeof tabs & [string, string, ...string[]]);
const tabsInformation = {
  "my-expenses": {
    title: "Finanzas Personales",
    description: "Mantén un seguimiento de tus gastos cotidianos.",
  },
  "as-lender": {
    title: "Deudas que Has Otorgado",
    description: "Visualiza las deudas donde tú eres el prestador y otros son los deudores.",
  },
  "as-borrower": {
    title: "Préstamos Recibidos",
    description: "Lista de deudas en las que otros te han designado como deudor.",
  },
} satisfies Record<
  Tab,
  {
    title: string;
    description: string;
  }
>;

const Dashboard: NextPageWithLayout = () => {
  const router = useCustomRouter();

  const queryTab = tabIdsSchema.catch(tabs[0]).parse(router.query.group);
  const initialTab = tabs.find((tab) => tab === queryTab) ?? tabs[0];

  const [selectedTab, tabSetters] = useTabs(tabs, {
    initialTab,
  });

  return (
    <Tabs
      value={selectedTab}
      onValueChange={(id) => {
        const tab = tabs.find((tabId) => tabId === id) ?? tabs[0];
        tabSetters.set(tab);
        void router.push({
          pathname: "/dashboard",
          query: {
            group: id,
          },
        });
      }}>
      <div className="border-b-border/50 mb-2 flex flex-col gap-4 border-b pb-2">
        <Tabs.List className="self-start">
          <Tabs.Trigger value={tabs[0]}>Prestador</Tabs.Trigger>
          <Tabs.Trigger value={tabs[1]}>Deudor</Tabs.Trigger>
          <Tabs.Trigger value={tabs[2]}>Mis Gastos</Tabs.Trigger>
        </Tabs.List>

        {selectedTab && (
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl font-semibold tracking-tight">
              {tabsInformation[selectedTab].title}
            </h2>
            <p className="text-muted-foreground">{tabsInformation[selectedTab].description}</p>
          </div>
        )}
      </div>

      <Tabs.Content value={tabs[0]} className="flex flex-col justify-between gap-4">
        <DebtsAsLenderTab />
      </Tabs.Content>

      <Tabs.Content value={tabs[1]} className="flex flex-col justify-between gap-4">
        <h1>HI</h1>
      </Tabs.Content>

      <Tabs.Content value={tabs[2]} className="flex flex-col justify-between gap-4">
        <h1>HI</h1>
      </Tabs.Content>
    </Tabs>
  );
};

Dashboard.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Dashboard;
