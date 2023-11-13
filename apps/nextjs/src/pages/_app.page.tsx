import { type AppProps } from "next/app";
import React, { type ReactElement, type ReactNode } from "react";
import { type NextPage } from "next";
import { ThemeProvider } from "next-themes";
import "$/styles/globals.css";
import { StyledToaster } from "src/components/ui/styled-toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  pageProps: Record<string, unknown>;
};

export const queryClient = new QueryClient();

const MyApp = ({ Component, pageProps: { ...pageProps } }: AppPropsWithLayout): JSX.Element => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <QueryClientProvider client={queryClient}>
      <StyledToaster />
      <ThemeProvider attribute="class">{getLayout(<Component {...pageProps} />)}</ThemeProvider>
    </QueryClientProvider>
  );
};

export default MyApp;
