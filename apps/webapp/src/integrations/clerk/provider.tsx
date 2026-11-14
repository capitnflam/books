import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import type { FC, ReactNode } from 'react';

/**
 * Reloads the page's data when someone signs in or out without a page load, as through the
 * sign-in modal: loaders read the session on the server, so their data is stale otherwise.
 */
const ReloadOnSessionChange: FC = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  // The user the page's data was loaded for; undefined until Clerk has loaded.
  const loadedFor = useRef<string | null>(undefined);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const current = userId ?? null;

    if (loadedFor.current !== undefined && loadedFor.current !== current) {
      void router.invalidate();
    }

    loadedFor.current = current;
  }, [isLoaded, userId, router]);

  return null;
};

export default function AppClerkProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ReloadOnSessionChange />
      {children}
    </ClerkProvider>
  );
}
