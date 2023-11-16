import { useRouter } from "next/router";
import NProgress from "nprogress";

export function useCustomRouter(): ReturnType<typeof useRouter> {
  const router = useRouter();

  const originalPush = router.push;

  router.push = (...args: Parameters<typeof router.push>): ReturnType<typeof originalPush> => {
    NProgress.start();
    return originalPush(...args);
  };

  return router;
}
