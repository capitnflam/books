import { Button } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { Link } from '@tanstack/react-router';

import ErrorMessage from '#/components/ErrorMessage';
import { m } from '#/paraglide/messages';

import TakenIsbnMessage from './TakenIsbnMessage';

import type { FC } from 'react';

type EditFormActionsProps = {
  bookId: string;
  /** Some field is marked as wrong. */
  invalid: boolean;
  status: 'idle' | 'saving' | 'failed' | 'not-found' | 'isbn-taken';
  taken: { bookId: string; title: string } | null;
};

/** The end of an edit form: why it was not saved, and the buttons to save or leave. */
const EditFormActions: FC<EditFormActionsProps> = ({ bookId, invalid, status, taken }) => (
  <div className="flex flex-wrap-reverse items-center justify-end gap-4">
    {invalid && <ErrorMessage>{m.book_form_invalid()}</ErrorMessage>}
    {taken && <TakenIsbnMessage {...taken} />}
    {status === 'failed' && <ErrorMessage>{m.book_save_failed()}</ErrorMessage>}
    {status === 'not-found' && <ErrorMessage>{m.book_gone()}</ErrorMessage>}
    <div className="flex gap-3">
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link to="/books/$bookId" params={{ bookId }} />}
      >
        {m.book_cancel()}
      </Button>
      <Button type="submit" disabled={status === 'saving'}>
        <Icon icon="device-floppy" aria-hidden data-icon="inline-start" />
        {m.book_save()}
      </Button>
    </div>
  </div>
);

export default EditFormActions;
