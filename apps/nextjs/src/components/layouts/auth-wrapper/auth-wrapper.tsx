import React, { type FC, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useSession } from "$/lib/hooks/use-session/use-session";
import LoadingPage from "$/components/pages/loading-page";

type Props = {
  children: ReactNode;
};

const AuthWrapper: FC<Props> = ({ children }) => {
  const session = useSession();

  if (session.status === "loading" || session.status === "unauthenticated") return <LoadingPage />;

  return children;
};

const ClientSideAuthWrapper = dynamic(() => Promise.resolve(AuthWrapper), {
  ssr: false,
});

export { ClientSideAuthWrapper as AuthWrapper };
