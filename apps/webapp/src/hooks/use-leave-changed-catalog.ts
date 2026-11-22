import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';

import type { NavigateOptions } from '@tanstack/react-router';

/** Goes to another page once the catalogue has changed. */
export function useLeaveChangedCatalog() {
  const router = useRouter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async (destination: NavigateOptions) => {
    // Nothing loaded before the change may show again, not even while it reloads.
    router.clearCache();
    queryClient.removeQueries({ queryKey: ['books'] });
    await navigate(destination);
  };
}
