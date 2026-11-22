import ErrorMessage from '#/components/ErrorMessage';
import TextLink from '#/components/TextLink';
import { m } from '#/paraglide/messages';

import type { FC } from 'react';

type TakenIsbnMessageProps = { bookId: string; title: string };

/** Another edition has the ISBN: which book's, with a link to it. */
const TakenIsbnMessage: FC<TakenIsbnMessageProps> = ({ bookId, title }) => (
  <ErrorMessage>
    <span>
      {m.book_isbn_taken({ title })}{' '}
      <TextLink to="/books/$bookId" params={{ bookId }} className="underline">
        {m.book_view()}
      </TextLink>
    </span>
  </ErrorMessage>
);

export default TakenIsbnMessage;
