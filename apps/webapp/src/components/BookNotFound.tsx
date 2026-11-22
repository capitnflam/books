import BackLink from '#/components/BackLink';
import { m } from '#/paraglide/messages';

import type { FC } from 'react';

const BookNotFound: FC = () => (
  <div className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
    <BackLink to="/books">{m.book_back()}</BackLink>
    <h1>{m.book_not_found_title()}</h1>
    <p className="text-muted-foreground">{m.book_not_found_description()}</p>
  </div>
);

export default BookNotFound;
