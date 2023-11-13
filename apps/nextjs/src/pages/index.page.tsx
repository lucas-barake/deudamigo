import { DesignLayout } from "$/components/layouts/design-layout";
import { Button } from "$/components/ui/button";
import { Pages } from "$/lib/enums/pages";
import { type NextPageWithLayout } from "$/pages/_app.page";
import { CustomHead } from "$/components/layouts/custom-head";
import React from "react";
import Link from "next/link";
import { signInWithGoogle } from "$/lib/configs/firebase-config";
import { api } from "$/lib/configs/react-query-client";
import { useSession } from "$/lib/hooks/use-session/use-session";
import { useAuthStore } from "$/lib/stores/use-auth-store";
import { useRouter } from "next/router";

const Home: NextPageWithLayout = () => {
  const authStore = useAuthStore();
  const session = useSession({
    redirectOnAuth: true,
  });
  const router = useRouter();
  const loginMutation = api.auth.login.useMutation({
    onSuccess(data) {
      authStore.set({
        status: "authenticated",
        user: data.body,
      });
      void router.push(Pages.DASHBOARD);
    },
  });

  async function handleSignIn(): Promise<void> {
    try {
      const result = await signInWithGoogle();
      const token = await result.user.getIdToken();
      await loginMutation.mutateAsync({ headers: { authorization: `Bearer ${token}` } });
    } catch (error: unknown) {
      console.error(error);
    }
  }

  return (
    <DesignLayout>
      <div className="flex items-center justify-center">
        <div className="max-w-2xl py-32 text-center sm:py-48 lg:py-56">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200 sm:text-6xl">
            Gestiona, comparte y analiza tus <span className="text-indigo-500">finanzas</span> con
            tu mejor aliado.
          </h1>

          <p className="mt-6 text-lg leading-8">
            Deudamigo es tu compañero en la gestión de deudas y gastos. Comparte responsabilidades
            financieras con tus seres queridos y mantén un registro claro de cada centavo.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3">
            <Button
              onClick={() => {
                void handleSignIn();
              }}
              loading={loginMutation.isLoading || session.status === "loading"}
              size="lg">
              Empezar ahora
            </Button>

            <p className="text-sm">
              Al continuar, aceptas nuestros{" "}
              <Link
                href={Pages.LEGAL}
                className="font-medium text-blue-600 hover:underline focus:underline dark:text-blue-500">
                términos y condiciones
              </Link>
            </p>
          </div>
        </div>
      </div>
    </DesignLayout>
  );
};

Home.getLayout = (page) => {
  return (
    <React.Fragment>
      <CustomHead />
      {page}
    </React.Fragment>
  );
};

export default Home;
