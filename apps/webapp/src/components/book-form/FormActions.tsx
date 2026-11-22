import { buttonVariants } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { Link } from '@tanstack/react-router';

import ErrorMessage from '#/components/ErrorMessage';
import FormStatus from '#/components/form/FormStatus';
import SubmitButton from '#/components/form/SubmitButton';
import { m } from '#/paraglide/messages';

import TakenIsbnMessage from './TakenIsbnMessage';

import type { SaveProblem } from '#/hooks/use-save-book';
import type { FC } from 'react';

type FormActionsProps = {
  bookId: string;
  problem: SaveProblem | null;
  /** Whether the form adds an edition to the book, rather than changes what is there. */
  adding?: boolean;
};

/** The end of a form opened from a book: why it was not saved, and the buttons to save or leave. */
const FormActions: FC<FormActionsProps> = ({ bookId, problem, adding = false }) => (
  <div className="flex flex-wrap-reverse items-center justify-end gap-4">
    <FormStatus>
      {problem?.error === 'isbn-taken' && (
        <TakenIsbnMessage bookId={problem.bookId} title={problem.title} />
      )}
      {problem?.error === 'failed' && (
        <ErrorMessage>
          {adding ? m.book_edition_create_failed() : m.book_save_failed()}
        </ErrorMessage>
      )}
      {problem?.error === 'not-found' && (
        <ErrorMessage>{adding ? m.book_not_found_description() : m.book_gone()}</ErrorMessage>
      )}
    </FormStatus>
    <div className="flex gap-3">
      <Link
        to="/books/$bookId"
        params={{ bookId }}
        className={buttonVariants({ variant: 'outline' })}
      >
        {m.book_cancel()}
      </Link>
      <SubmitButton>
        <Icon
          icon={adding ? 'book-upload' : 'device-floppy'}
          aria-hidden
          data-icon="inline-start"
        />
        {adding ? m.book_create() : m.book_save()}
      </SubmitButton>
    </div>
  </div>
);

export default FormActions;
