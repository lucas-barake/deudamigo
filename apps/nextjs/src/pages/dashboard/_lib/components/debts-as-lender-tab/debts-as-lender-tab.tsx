import React from "react";
import { TimeInMs } from "$/lib/enums/time";
import PageControls from "$/pages/dashboard/_lib/components/page-controls";
import FiltersMenu from "src/pages/dashboard/_lib/components/filters-menu";
import SortMenu from "$/pages/dashboard/_lib/components/sort-menu";
import DebtCard from "src/pages/dashboard/_lib/components/debt-card";
import PartnersFilterDialog from "src/pages/dashboard/_lib/components/partners-filter-dialog";
import { api } from "$/lib/configs/react-query-client";
import { contracts, DEBTS_QUERY_PAGINATION_LIMIT, getLenderDebtsInput } from "@deudamigo/ts-rest";
import { useSessionStorage } from "$/lib/hooks/browser-storage/use-session-storage";
import DebtAsLenderCard from "$/pages/dashboard/_lib/components/debts-as-lender-tab/debt-as-lender-card";
import DebtsGrid from "$/pages/dashboard/_lib/components/debts-grid";
import AddDebtDialog from "$/pages/dashboard/_lib/components/debts-as-lender-tab/add-debt-dialog";

const DebtsAsLenderTab: React.FC = () => {
  const { state: queryVariables, setState: setQueryVariables } = useSessionStorage({
    validationSchema: getLenderDebtsInput,
    defaultValues: {
      skip: 0,
      sort: "desc",
      status: "active",
      partnerEmail: null,
    },
    key: "recurrent-debts-as-lender-tab-query-variables",
  });

  const query = api.debts.getLenderDebts.useQuery(
    [contracts.debts.getLenderDebts, queryVariables],
    { query: queryVariables },
    {
      staleTime: TimeInMs.ThirtySeconds,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  );
  const debts = query.data?.body.debts ?? [];

  return (
    <React.Fragment>
      <div className="flex items-center justify-between">
        <AddDebtDialog queryVariables={queryVariables} />

        <div className="flex items-center gap-2">
          <PartnersFilterDialog
            type="lender"
            selectedPartnerEmail={queryVariables.partnerEmail}
            selectPartnerEmail={(partnerEmail) => {
              setQueryVariables({
                ...queryVariables,
                partnerEmail,
                skip: 0,
              });
            }}
          />

          <SortMenu
            selectedSort={queryVariables.sort}
            setSelectedSort={(sort) => {
              setQueryVariables({ ...queryVariables, sort, skip: 0 });
            }}
          />

          <FiltersMenu
            selectedStatus={queryVariables.status}
            setSelectedStatus={(status) => {
              setQueryVariables({
                ...queryVariables,
                status,
                skip: 0,
              });
            }}
            lender
          />
        </div>
      </div>

      {query.isSuccess && debts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground text-center text-lg">No hay nada aquí...</p>
        </div>
      )}

      <DebtsGrid>
        {query.isLoading ? (
          <React.Fragment>
            {Array.from({ length: DEBTS_QUERY_PAGINATION_LIMIT }).map((_, index) => (
              <DebtCard.Skeleton key={index} />
            ))}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {debts.map((debt) => (
              <DebtAsLenderCard key={debt.id} debt={debt} queryVariables={queryVariables} />
            ))}
          </React.Fragment>
        )}
      </DebtsGrid>

      <PageControls
        page={queryVariables.skip / DEBTS_QUERY_PAGINATION_LIMIT}
        setPage={(page) => {
          setQueryVariables({
            ...queryVariables,
            skip: page * DEBTS_QUERY_PAGINATION_LIMIT,
          });
        }}
        count={query.data?.body.count ?? 0}
      />
    </React.Fragment>
  );
};

export default DebtsAsLenderTab;
