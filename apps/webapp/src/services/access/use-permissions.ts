import { useAuth } from '@clerk/tanstack-react-start';
import { useQuery } from '@tanstack/react-query';

import { getMyPermissionsFn } from './access.functions';

import type { Permission } from '@books/database';

/**
 * The signed-in user's permissions, refetched when another user signs in. For showing or
 * hiding links only: pages and server functions check permissions on the server.
 */
export function usePermissions(): Permission[] {
  const { isSignedIn, userId } = useAuth();
  const { data } = useQuery({
    queryKey: ['permissions', userId],
    queryFn: () => getMyPermissionsFn(),
    enabled: isSignedIn === true,
  });

  return isSignedIn ? (data ?? []) : [];
}
