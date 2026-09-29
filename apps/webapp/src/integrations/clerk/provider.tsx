import { ClerkProvider } from "@clerk/tanstack-react-start";

import { clientEnv } from "#/config/env";

const PUBLISHABLE_KEY = clientEnv.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env.local file");
}

export default function AppClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  );
}
