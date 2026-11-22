import { useState } from 'react';

import { useLeaveChangedCatalog } from './use-leave-changed-catalog';

type SaveResult =
  | { error: null }
  | { error: 'not-found' }
  | { error: 'isbn-taken'; bookId: string; title: string };

/** Why a book or an edition was not saved. */
export type SaveProblem = Exclude<SaveResult, { error: null }> | { error: 'failed' };

/** Saves a book or one of its editions, then goes back to the book's page. */
export function useSaveBook(bookId: string) {
  const leave = useLeaveChangedCatalog();
  const [problem, setProblem] = useState<SaveProblem | null>(null);

  const save = async (action: () => Promise<SaveResult>) => {
    setProblem(null);

    try {
      const result = await action();

      if (result.error !== null) {
        setProblem(result);

        return;
      }

      await leave({ to: '/books/$bookId', params: { bookId } });
    } catch {
      setProblem({ error: 'failed' });
    }
  };

  return { problem, save };
}
