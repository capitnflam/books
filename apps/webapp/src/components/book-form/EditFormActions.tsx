import { Button } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { Link } from '@tanstack/react-router';

import ErrorMessage from '#/components/ErrorMessage';
import FormStatus from '#/components/form/FormStatus';
import SubmitButton from '#/components/form/SubmitButton';
import { m } from '#/paraglide/messages';

import TakenIsbnMessage from './TakenIsbnMessage';

import type { SaveProblem } from '#/hooks/use-save-book';
import type { FC } from 'react';

type EditFormActionsProps = { bookId: string; problem: SaveProblem | null };

/** The end of an edit form: why it was not saved, and the buttons to save or leave. */
const EditFormActions: FC<EditFormActionsProps> = ({ bookId, problem }) => (
  <div className="flex flex-wrap-reverse items-center justify-end gap-4">
    <FormStatus>
      {problem?.error === 'isbn-taken' && (
        <TakenIsbnMessage bookId={problem.bookId} title={problem.title} />
      )}
      {problem?.error === 'failed' && <ErrorMessage>{m.book_save_failed()}</ErrorMessage>}
      {problem?.error === 'not-found' && <ErrorMessage>{m.book_gone()}</ErrorMessage>}
    </FormStatus>
    <div className="flex gap-3">
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link to="/books/$bookId" params={{ bookId }} />}
      >
        {m.book_cancel()}
      </Button>
      <SubmitButton>
        <Icon icon="device-floppy" aria-hidden data-icon="inline-start" />
        {m.book_save()}
      </SubmitButton>
    </div>
  </div>
);

export default EditFormActions;
