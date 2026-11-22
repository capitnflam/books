import { useState } from 'react';

import { useLeaveChangedCatalog } from './use-leave-changed-catalog';

import type { NavigateOptions } from '@tanstack/react-router';

/** Deletes what the page is about, then leaves it: there is nothing to reload. */
export function useDeleteFromCatalog(destination: NavigateOptions) {
  const leave = useLeaveChangedCatalog();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setPending(true);
    setFailed(false);

    try {
      await action();
      await leave(destination);

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
