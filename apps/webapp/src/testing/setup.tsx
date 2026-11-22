import '@books/ui/globals.css';
import { afterEach, beforeEach, vi } from 'vitest';

import { getSidebarOpenFn, getThemeFn } from '#/services/preferences/preferences.functions';

import { readIn, signOut } from './session';

import type { ReactNode } from 'react';

// The pages run as they are, down to the router and its guards. What they can't have in a
// browser without a server is replaced: every server function, and Clerk.

/** Server functions that fail until the test says what they answer. */
const serverFunctions = vi.hoisted(
  () =>
    (...names: string[]) =>
      Object.fromEntries(
        names.map((name) => [
          name,
          vi.fn<() => Promise<unknown>>(async () => {
            throw new Error(`${name} was called, but the test gives it no answer.`);
          }),
        ]),
      ),
);

vi.mock('#/services/access/access.functions', () =>
  serverFunctions('checkPermissionFn', 'getMyPermissionsFn'),
);
vi.mock('#/services/authentication/authentication.functions', () =>
  serverFunctions('checkIsAuthenticatedFn'),
);
vi.mock('#/services/catalog/catalog.functions', () =>
  serverFunctions(
    'createBookFn',
    'createEditionFn',
    'deleteBookFn',
    'deleteEditionFn',
    'deleteIndexEntriesFn',
    'getBookFn',
    'listBooksFn',
    'listIndexFn',
    'lookupIsbnFn',
    'updateBookFn',
    'updateEditionFn',
  ),
);
vi.mock('#/services/feature-flags/feature-flags.functions', () =>
  serverFunctions(
    'createFeatureFlagFn',
    'deleteFeatureFlagFn',
    'getFeatureFlagFn',
    'grantFeatureFlagFn',
    'listFeatureFlagsFn',
    'listFlagCandidatesFn',
    'listFlagHoldersFn',
    'revokeFeatureFlagFn',
    'updateFeatureFlagFn',
  ),
);
vi.mock('#/services/preferences/preferences.functions', () =>
  serverFunctions('getSidebarOpenFn', 'getThemeFn'),
);
vi.mock('#/services/profile/profile.functions', () =>
  serverFunctions('getProfileFn', 'updateDisplayNameFn'),
);
vi.mock('#/services/user-management/user-management.functions', () =>
  serverFunctions(
    'deleteUserFn',
    'getUserDetailsFn',
    'listUsersFn',
    'setRoleFn',
    'setUserBlockedFn',
    'updateUserDisplayNameFn',
  ),
);
vi.mock('#/services/users/users.functions', () => serverFunctions('getAuthenticatedUserFn'));

vi.mock('@clerk/tanstack-react-start', () => ({
  ClerkProvider: ({ children }: { children: ReactNode }) => children,
  SignIn: () => <p>Clerk sign-in form</p>,
  SignInButton: ({ children }: { children: ReactNode }) => children,
  SignUp: () => <p>Clerk sign-up form</p>,
  useAuth: vi.fn<() => unknown>(),
  useClerk: vi.fn<() => unknown>(),
  useUser: vi.fn<() => unknown>(),
}));

vi.mock(import('#/paraglide/runtime'), async (importOriginal) => {
  const runtime = await importOriginal();

  return {
    ...runtime,
    // Reads the locale `readIn` sets.
    getLocale: () => runtime.getLocale(),
    // Switching language loads the page again, which would end the test run.
    setLocale: vi.fn<typeof runtime.setLocale>(),
  };
});

beforeEach(() => {
  signOut();
  readIn('en');
  vi.mocked(getThemeFn).mockResolvedValue('light');
  vi.mocked(getSidebarOpenFn).mockResolvedValue(true);
});

afterEach(() => {
  document.documentElement.classList.remove('dark');
});
