import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import type { FormEvent } from 'react';

type SaveResult =
  | { error: null }
  | { error: 'not-found' }
  | { error: 'isbn-taken'; bookId: string; title: string };

type EditBookFormOptions<Form> = {
  bookId: string;
  initial: Form;
  /** The fields the server would refuse. */
  errorsOf: (form: Form) => Set<string>;
  save: (form: Form) => Promise<SaveResult>;
};

type EditStatus = { status: 'idle' | 'saving' | 'failed' | 'not-found' };

/**
 * The state of a form editing a book or one of its editions: saves it, then goes back to the
 * book's page. Fields are checked once the form has been sent, then again as they change.
 */
export function useEditBookForm<Form>({
  bookId,
  initial,
  errorsOf,
  save,
}: EditBookFormOptions<Form>) {
  const router = useRouter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [state, setState] = useState<EditStatus | Extract<SaveResult, { error: 'isbn-taken' }>>({
    status: 'idle',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (errorsOf(form).size > 0) {
      setState({ status: 'idle' });

      return;
    }

    setState({ status: 'saving' });

    try {
      const result = await save(form);

      if (result.error === 'isbn-taken') {
        setState(result);

        return;
      }

      if (result.error === 'not-found') {
        setState({ status: 'not-found' });

        return;
      }

      // Nothing loaded before the change may show again, not even while it reloads.
      router.clearCache();
      queryClient.removeQueries({ queryKey: ['books'] });
      await navigate({ to: '/books/$bookId', params: { bookId } });
    } catch {
      setState({ status: 'failed' });
    }
  };

  return {
    form,
    update: (change: Partial<Form>) => setForm((current) => ({ ...current, ...change })),
    errors: submitted ? errorsOf(form) : new Set<string>(),
    status: 'status' in state ? state.status : ('isbn-taken' as const),
    /** The book whose edition has the ISBN, when it is taken. */
    taken: 'status' in state ? null : { bookId: state.bookId, title: state.title },
    handleSubmit,
  };
}
