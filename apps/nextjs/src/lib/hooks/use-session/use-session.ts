import { api } from "$/lib/configs/react-query-client";
import { type AuthStore, useAuthStore } from "$/lib/stores/use-auth-store";
import { useRouter } from "next/router";
import { Pages } from "$/lib/enums/pages";
import { TimeInMs } from "$/lib/enums/time";

type UseSessionReturn = {
  user: AuthStore["user"];
  status: AuthStore["status"];
  refresh: () => void;
  clear: () => void;
};
type UseSessionArgs =
  | {
      redirectOnAuth?: boolean;
    }
  | undefined;

export function useSession(args: UseSessionArgs = {}): UseSessionReturn {
  const auth = useAuthStore();
  const router = useRouter();

  const meQuery = api.auth.me.useQuery(["me"], api.auth.me.query, {
    cacheTime: TimeInMs.FortyFiveMinutes,
    staleTime: TimeInMs.FortyFiveMinutes,
    enabled: auth.user === null,
    refetchOnWindowFocus: false,
    retry(failureCount, error) {
      return error.status !== 403 && failureCount < 3;
    },
    onSuccess(data) {
      auth.set({ user: data.body, status: "authenticated" });

      if (args.redirectOnAuth === true) {
        void router.push(Pages.DASHBOARD);
      }
    },
    onError(error) {
      if (error.status === 403) {
        auth.clear();
        void router.push(Pages.HOME);
      }
    },
  });

  return {
    user: auth.user,
    status: auth.status,
    refresh() {
      meQuery.refetch();
    },
    clear() {
      auth.clear();
    },
  };
}
