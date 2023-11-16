import React from "react";
import { TimeInMs } from "$/lib/enums/time";
import DebtCard from "$/pages/dashboard/_lib/components/debt-card";
import PageControls from "$/pages/dashboard/_lib/components/page-controls";
import SortMenu from "$/pages/dashboard/_lib/components/sort-menu";
import FiltersMenu from "$/pages/dashboard/_lib/components/filters-menu";
import PartnersFilterDialog from "$/pages/dashboard/_lib/components/partners-filter-dialog";
import { useSessionStorage } from "$/lib/hooks/browser-storage/use-session-storage";
import { api } from "$/lib/configs/react-query-client";
import { DEBTS_QUERY_PAGINATION_LIMIT, getBorrowerDebtsInput } from "@deudamigo/ts-rest";
import DebtsGrid from "$/pages/dashboard/_lib/components/debts-grid";
import DebtAsBorrowerCard from "$/pages/dashboard/_lib/components/debts-as-borrower-tab/debt-as-borrower-card";

const DebtsAsBorrowerTab: React.FC = () => {
  const { state: queryVariables, setState: setQueryVariables } = useSessionStorage({
    validationSchema: getBorrowerDebtsInput,
    defaultValues: {
      skip: 0,
      sort: "desc",
      status: "active",
      partnerEmail: null,
    },
    key: "recurrent-debts-as-borrower-tab-query-variables",
  });

  const query = api.debts.getBorrowerDebts.useQuery(
    ["getBorrowerDebts"],
    {
      query: queryVariables,
    },
    {
      staleTime: TimeInMs.FifteenSeconds,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  );
  const debts = query.data?.body.debts ?? [];

  return (
    <React.Fragment>
      <div className="flex items-center justify-end gap-2">
        <PartnersFilterDialog
          type="borrower"
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
          lender={false}
        />
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
          query.isSuccess && (
            <React.Fragment>
              {debts.map((debt) => (
                <DebtAsBorrowerCard key={debt.id} debt={debt} />
              ))}
            </React.Fragment>
          )
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

export default DebtsAsBorrowerTab;
