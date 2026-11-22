import { useAuth, useClerk, useUser } from '@clerk/tanstack-react-start';
import { redirect } from '@tanstack/react-router';
import { vi } from 'vitest';

import { overwriteGetLocale } from '#/paraglide/runtime';
import { checkPermissionFn, getMyPermissionsFn } from '#/services/access/access.functions';
import { checkIsAuthenticatedFn } from '#/services/authentication/authentication.functions';

import type { Locale } from '#/paraglide/runtime';
import type { Permission } from '@books/database';
import type { Mock } from 'vitest';

type Auth = ReturnType<typeof useAuth>;
type Clerk = ReturnType<typeof useClerk>;
type User = ReturnType<typeof useUser>;

const toSignIn = (redirectUrl: string | undefined) =>
  redirect({ to: '/sign-in/$', search: { redirect_url: redirectUrl ?? '/' } });

/** Shows the pages in `locale`, as its URL prefix would; English unless the test says so. */
export const readIn = (locale: Locale) => overwriteGetLocale(() => locale);

/** What the pages ask of Clerk: opening the reader's account, signing out. */
export function mockClerk(): { openUserProfile: Mock; signOut: Mock } {
  const clerk = {
    openUserProfile: vi.fn<() => void>(),
    signOut: vi.fn<() => Promise<void>>(),
  };

  vi.mocked(useClerk).mockReturnValue(clerk as unknown as Clerk);

  return clerk;
}

/** Nobody is signed in: the page guards send to the sign-in page. Every test starts so. */
export function signOut() {
  vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false, userId: null } as Auth);
  vi.mocked(useUser).mockReturnValue({ isLoaded: true, isSignedIn: false, user: null });
  mockClerk();
  vi.mocked(getMyPermissionsFn).mockResolvedValue([]);
  vi.mocked(checkIsAuthenticatedFn).mockImplementation(async (options) => {
    throw toSignIn(options?.data?.redirect_url);
  });
  vi.mocked(checkPermissionFn).mockImplementation(async ({ data }) => {
    throw toSignIn(data.redirect_url);
  });
}

/** Signs Ada Lovelace in: the page guards let them in where their permissions do. */
export function signIn(permissions: Permission[] = []) {
  vi.mocked(useAuth).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_ada',
  } as Auth);
  vi.mocked(useUser).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: {
      fullName: 'Ada Lovelace',
      imageUrl: '',
      primaryEmailAddress: { emailAddress: 'ada@example.com' },
    },
  } as User);
  vi.mocked(getMyPermissionsFn).mockResolvedValue(permissions);
  vi.mocked(checkIsAuthenticatedFn).mockResolvedValue();
  vi.mocked(checkPermissionFn).mockImplementation(async ({ data }) => {
    if (!permissions.includes(data.permission)) {
      throw redirect({ to: '/forbidden' });
    }
  });
}
