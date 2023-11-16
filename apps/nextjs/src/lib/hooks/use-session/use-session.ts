import { type AuthStore, useAuthStore } from "$/lib/stores/use-auth-store";
import { Pages } from "$/lib/enums/pages";
import { TimeInMs } from "$/lib/enums/time";
import { useCustomRouter } from "$/lib/hooks/use-custom-router";
import { api } from "$/lib/utils/api";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";

type UseSessionReturn = {
  user: AuthStore["user"];
  status: AuthStore["status"];
  refresh: () => void;
  signOut: () => Promise<void>;
};
type UseSessionArgs =
  | {
      redirectOnAuth?: boolean;
    }
  | undefined;

export function useSession(args: UseSessionArgs = {}): UseSessionReturn {
  const auth = useAuthStore();
  const router = useCustomRouter();

  const signOutMutation = api.auth.logout.useMutation({
    onSuccess() {
      auth.clear();
      void router.push(Pages.HOME);
    },
  });
  const meQuery = api.auth.me.useQuery(undefined, {
    cacheTime: TimeInMs.FortyFiveMinutes,
    staleTime: TimeInMs.FortyFiveMinutes,
    enabled: auth.user === null,
    refetchOnWindowFocus: false,
    retry(failureCount, error) {
      return error.shape?.code !== TRPC_ERROR_CODES_BY_KEY.UNAUTHORIZED && failureCount < 3;
    },
    onSuccess(data) {
      auth.set({ user: data, status: "authenticated" });

      if (args.redirectOnAuth === true) {
        void router.push(Pages.DASHBOARD);
      }
    },
    onError(error) {
      if (error.shape?.code === TRPC_ERROR_CODES_BY_KEY.UNAUTHORIZED) {
        auth.clear();
        void router.push(Pages.HOME);
      }
    },
  });

  return {
    user: auth.user,
    status: auth.status,
    refresh() {
      void meQuery.refetch();
    },
    async signOut() {
      await signOutMutation.mutateAsync();
    },
  };
}
