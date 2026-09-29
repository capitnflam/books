import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";

export async function checkIsAuthenticatedServer(redirect_url?: string) {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect({ to: "/sign-in/$", throw: true, search: { redirect_url: redirect_url ?? "/" } });
  }
}
