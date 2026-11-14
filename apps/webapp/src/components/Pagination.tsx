import { Button } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { Link } from '@tanstack/react-router';

import { m } from '#/paraglide/messages';

import type { LinkProps } from '@tanstack/react-router';
import type { FC } from 'react';

type PaginationProps = {
  /** What the pages are of, for screen readers: "Pages of the user list". */
  label: string;
  page: number;
  pages: number;
  /** Where the button to another page links. */
  linkTo: (page: number) => LinkProps;
};

/** Previous and next buttons under a paged list; hidden when everything fits on one page. */
const Pagination: FC<PaginationProps> = ({ label, page, pages, linkTo }) => {
  if (pages <= 1) {
    return null;
  }

  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">{m.pagination_page_of({ page, pages })}</p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link {...linkTo(page - 1)} />}
          >
            <Icon icon="chevron-left" aria-hidden data-icon="inline-start" />
            {m.pagination_previous()}
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <Icon icon="chevron-left" aria-hidden data-icon="inline-start" />
            {m.pagination_previous()}
          </Button>
        )}
        {page < pages ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link {...linkTo(page + 1)} />}
          >
            {m.pagination_next()}
            <Icon icon="chevron-right" aria-hidden data-icon="inline-end" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            {m.pagination_next()}
            <Icon icon="chevron-right" aria-hidden data-icon="inline-end" />
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Pagination;
