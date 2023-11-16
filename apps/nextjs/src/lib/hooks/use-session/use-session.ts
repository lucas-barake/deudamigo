import { api } from "$/lib/configs/react-query-client";
import { type AuthStore, useAuthStore } from "$/lib/stores/use-auth-store";
import { Pages } from "$/lib/enums/pages";
import { TimeInMs } from "$/lib/enums/time";
import { useCustomRouter } from "$/lib/hooks/use-custom-router";

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
      void meQuery.refetch();
    },
    async signOut() {
      await signOutMutation.mutateAsync({
        body: {},
      });
    },
  };
}
