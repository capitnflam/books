import { buttonVariants } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';

import BookCover from '#/components/BookCover';
import ListSearchForm from '#/components/ListSearchForm';
import TextLink from '#/components/TextLink';
import { VirtualTable } from '#/components/VirtualTable';
import { m } from '#/paraglide/messages';
import { usePermissions } from '#/services/access/use-permissions';
import { listBooksFn } from '#/services/catalog/catalog.functions';
import { formatYear } from '#/utils/dates';
import { formatList } from '#/utils/format-list';
import { nextPage, parseListSearch } from '#/utils/list-search';

import type { VirtualTableColumn } from '#/components/VirtualTable';

/** The catalogue, loaded a page at a time as it scrolls. */
const booksQuery = (q: string | undefined) =>
  infiniteQueryOptions({
    queryKey: ['books', { q }],
    queryFn: ({ pageParam }) => listBooksFn({ data: { q, page: pageParam } }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => nextPage(pages.length, last.total),
  });

export const Route = createFileRoute('/_app/books/')({
  validateSearch: parseListSearch,
  loaderDeps: ({ search }) => search,
  // The first page renders on the server; the rest load in the browser as the list scrolls.
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureInfiniteQueryData(booksQuery(deps.q));
  },
  head: () => ({ meta: [{ title: m.books_title() }] }),
  component: BooksPage,
});

type ListedBook = Awaited<ReturnType<typeof listBooksFn>>['books'][number];

const columns: VirtualTableColumn<ListedBook>[] = [
  {
    id: 'book',
    header: m.books_column_book,
    cell: (book) => (
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-10 shrink-0 items-center justify-center">
          <BookCover
            url={book.coverImageUrl}
            alt=""
            className="max-h-14 max-w-10"
            fallback={<Icon icon="book" aria-hidden className="text-gilt size-6" />}
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <TextLink to="/books/$bookId" params={{ bookId: book.id }} className="font-semibold">
            {book.title}
          </TextLink>
          {book.subtitle && <span className="text-muted-foreground text-sm">{book.subtitle}</span>}
        </div>
      </div>
    ),
  },
  {
    id: 'authors',
    header: m.books_column_authors,
    cell: (book) => formatList(book.authors),
  },
  {
    id: 'first-published',
    header: m.book_first_published_label,
    cell: (book) => book.firstPublishedYear !== null && formatYear(book.firstPublishedYear),
    className: 'text-muted-foreground text-sm whitespace-nowrap',
  },
];

function BooksPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const canAdd = usePermissions().includes('catalog:manage');
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useInfiniteQuery(booksQuery(q));
  const books = data?.pages.flatMap((page) => page.books) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-4 py-16">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-overline text-muted-foreground uppercase">{m.nav_group_library()}</p>
          <h1>{m.books_title()}</h1>
          <span aria-hidden className="bg-gilt h-0.5 w-16" />
          <p className="text-muted-foreground mt-1">{m.books_intro()}</p>
        </div>
        {canAdd && (
          <Link to="/books/new" className={buttonVariants()}>
            <Icon icon="book-upload" aria-hidden data-icon="inline-start" />
            {m.nav_add_book()}
          </Link>
        )}
      </header>

      <ListSearchForm
        id="books-search"
        label={m.books_search_label()}
        submitLabel={m.books_search_submit()}
        query={q}
        onSearch={(query) => void navigate({ search: { q: query } })}
      />

      <section aria-labelledby="books-results" className="flex flex-col gap-4">
        <h2 id="books-results" className="text-heading-3 border-rule border-b pb-1.5">
          {q
            ? m.books_results_matching({ count: total, query: q })
            : m.books_results({ count: total })}
        </h2>

        {books.length === 0 ? (
          <p className="text-muted-foreground text-base/6">
            {q ? m.books_empty_search({ query: q }) : m.books_empty()}
          </p>
        ) : (
          <VirtualTable
            label={m.books_title()}
            rows={books}
            total={total}
            columns={columns}
            hasMore={hasNextPage}
            loadingMore={isFetchingNextPage}
            loadFailed={isFetchNextPageError}
            loadMore={() => void fetchNextPage()}
          />
        )}
      </section>
    </div>
  );
}
