import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';

/**
 * Runs a change on the server, then reloads the page's data. Tracks whether a change is
 * running, so the buttons wait for it, and whether the last one failed.
 */
export function useServerAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setPending(true);
    setFailed(false);

    try {
      await action();
      await router.invalidate();

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
