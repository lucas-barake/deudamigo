import { type AppProps } from "next/app";
import React, { type ReactElement, type ReactNode } from "react";
import { type NextPage } from "next";
import { ThemeProvider } from "next-themes";
import "$/styles/globals.css";
import { StyledToaster } from "$/components/ui/styled-toaster";
import NextTopLoader from "nextjs-toploader";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import { api } from "$/lib/utils/api";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  pageProps: Record<string, unknown>;
};

const MyApp = ({ Component, pageProps: { ...pageProps } }: AppPropsWithLayout): JSX.Element => {
  const getLayout = Component.getLayout ?? ((page) => page);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return (
    <React.Fragment>
      <NextTopLoader showSpinner={false} />
      <StyledToaster />
      <ThemeProvider attribute="class">{getLayout(<Component {...pageProps} />)}</ThemeProvider>
    </React.Fragment>
  );
};

export default api.withTRPC(MyApp);
