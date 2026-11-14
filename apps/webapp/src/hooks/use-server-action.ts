import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import type { QueryKey } from '@tanstack/react-query';

/**
 * Runs a change on the server, then reloads the page's data, and the queries under
 * `queryKey` when given. Tracks whether a change is running, so the buttons wait for it,
 * and whether the last one failed.
 */
export function useServerAction(queryKey?: QueryKey) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setPending(true);
    setFailed(false);

    try {
      await action();
      await Promise.all([
        router.invalidate(),
        queryKey && queryClient.invalidateQueries({ queryKey }),
      ]);

      return true;
    } catch {
      setFailed(true);

      return false;
    } finally {
      setPending(false);
    }
  };

  return { pending, failed, run };
}
