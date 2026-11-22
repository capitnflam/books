import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

type SaveResult =
  | { error: null }
  | { error: 'not-found' }
  | { error: 'isbn-taken'; bookId: string; title: string };

/** Why a book or an edition was not saved. */
export type SaveProblem = Exclude<SaveResult, { error: null }> | { error: 'failed' };

/** Saves a book or one of its editions, then goes back to the book's page. */
export function useSaveBook(bookId: string) {
  const router = useRouter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [problem, setProblem] = useState<SaveProblem | null>(null);

  const save = async (action: () => Promise<SaveResult>) => {
    setProblem(null);

    try {
      const result = await action();

      if (result.error !== null) {
        setProblem(result);

        return;
      }

      // Nothing loaded before the change may show again, not even while it reloads.
      router.clearCache();
      queryClient.removeQueries({ queryKey: ['books'] });
      await navigate({ to: '/books/$bookId', params: { bookId } });
    } catch {
      setProblem({ error: 'failed' });
    }
  };

  return { problem, save };
}
