import { buttonVariants } from '@books/ui/components/button';
import { Checkbox } from '@books/ui/components/checkbox';
import { Field, FieldLabel } from '@books/ui/components/field';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import DeleteSection from '#/components/DeleteSection';
import ErrorMessage from '#/components/ErrorMessage';
import ListSearchForm from '#/components/ListSearchForm';
import { VirtualTable } from '#/components/VirtualTable';
import { useServerAction } from '#/hooks/use-server-action';
import { m } from '#/paraglide/messages';
import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';
import { INDEX_KINDS, parseIndexSearch } from '#/services/catalog/catalog-index';
import { deleteIndexEntriesFn, listIndexFn } from '#/services/catalog/catalog.functions';
import { nextPage } from '#/utils/list-search';
import { inBulkBatches } from '#/utils/selection';

import type { VirtualTableColumn } from '#/components/VirtualTable';
import type { IndexKind } from '#/services/catalog/catalog-index';
import type { FC } from 'react';

type IndexSearch = { kind: IndexKind; q?: string; unused?: true };

/** A part of the index, loaded a page at a time as it scrolls; it changes with the books. */
const indexQuery = ({ kind, q, unused }: IndexSearch) =>
  infiniteQueryOptions({
    queryKey: ['books', 'index', { kind, q, unused }],
    queryFn: ({ pageParam }) => listIndexFn({ data: { kind, q, unused, page: pageParam } }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => nextPage(pages.length, last.total),
  });

const DEFAULT_KIND = 'authors' satisfies IndexKind;

export const Route = createFileRoute('/_app/catalog-index')({
  validateSearch: parseIndexSearch,
  beforeLoad: async ({ location }) => {
    // The server functions the page calls check the permission again on their own.
    await checkPermissionFn({
      data: { permission: 'catalog:manage', redirect_url: localizeHref(location.href) },
    });
  },
  loaderDeps: ({ search }) => search,
  // The first page renders on the server; the rest load in the browser as the list scrolls.
  loader: async ({ context, deps: { kind = DEFAULT_KIND, ...search } }) => {
    await context.queryClient.ensureInfiniteQueryData(indexQuery({ kind, ...search }));
  },
  head: () => ({ meta: [{ title: m.index_title() }] }),
  component: IndexPage,
});

type Entry = Awaited<ReturnType<typeof listIndexFn>>['entries'][number];

const kindLabels: Record<IndexKind, () => string> = {
  authors: m.index_kind_authors,
  series: m.index_kind_series,
  publishers: m.index_kind_publishers,
  subjects: m.index_kind_subjects,
};

const deleteDescriptions: Record<IndexKind, () => string> = {
  authors: m.index_delete_description_authors,
  series: m.index_delete_description_series,
  publishers: m.index_delete_description_publishers,
  subjects: m.index_delete_description_subjects,
};

const columns: VirtualTableColumn<Entry>[] = [
  { id: 'name', header: m.index_column_name, cell: ({ name }) => name },
  {
    id: 'books',
    header: m.index_column_books,
    cell: ({ bookCount }) => bookCount,
    className: 'text-muted-foreground text-sm',
  },
];

const IndexEntries: FC<{ search: IndexSearch }> = ({ search }) => {
  const { kind, q } = search;
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useInfiniteQuery(indexQuery(search));
  const { pending, failed, run } = useServerAction(['books']);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [kept, setKept] = useState(0);
  const entries = data?.pages.flatMap((page) => page.entries) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  const handleDelete = async () => {
    let keptCount = 0;

    setKept(0);

    const deleted = await run(async () => {
      for (const ids of inBulkBatches([...selected])) {
        const result = await deleteIndexEntriesFn({ data: { kind, ids } });

        keptCount += result.kept;
      }
    });

    if (deleted) {
      setSelected(new Set());
      setKept(keptCount);
    }

    return deleted;
  };

  return (
    <>
      <section aria-labelledby="index-results" className="flex flex-col gap-4">
        <h2 id="index-results" className="text-heading-3 border-rule border-b pb-1.5">
          {q
            ? m.index_results_matching({ kind: kindLabels[kind](), query: q, count: total })
            : m.index_results({ kind: kindLabels[kind](), count: total })}
        </h2>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-base/6">{m.index_empty()}</p>
        ) : (
          <VirtualTable
            label={kindLabels[kind]()}
            rows={entries}
            total={total}
            columns={columns}
            hasMore={hasNextPage}
            loadingMore={isFetchingNextPage}
            loadFailed={isFetchNextPageError}
            loadMore={() => void fetchNextPage()}
            selection={{
              selected,
              onSelectedChange: setSelected,
              disabled: pending,
              rowLabel: (id) => m.index_select({ name: byId.get(id)?.name ?? '' }),
              allLabel: m.index_select_loaded(),
              // A book must not lose its author: the server refuses these too.
              isSelectable: (id) => kind !== 'authors' || byId.get(id)?.bookCount === 0,
            }}
          />
        )}
        {kept > 0 && <ErrorMessage>{m.index_delete_kept({ count: kept })}</ErrorMessage>}
      </section>

      <DeleteSection
        id="index-delete"
        title={m.index_delete_heading()}
        description={deleteDescriptions[kind]()}
        label={m.index_delete({ count: selected.size })}
        question={m.index_delete_confirm({ count: selected.size })}
        confirmLabel={m.index_delete_confirm_button()}
        cancelLabel={m.index_delete_cancel()}
        error={failed && m.index_delete_failed()}
        pending={pending}
        disabled={selected.size === 0}
        onDelete={handleDelete}
      />
    </>
  );
};

function IndexPage() {
  const { kind = DEFAULT_KIND, q, unused } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-overline text-muted-foreground uppercase">{m.nav_group_library()}</p>
        <h1>{m.index_title()}</h1>
        <span aria-hidden className="bg-gilt h-0.5 w-16" />
        <p className="text-muted-foreground mt-1">{m.index_intro()}</p>
      </header>

      <nav aria-label={m.index_kinds_label()}>
        <ul className="flex flex-wrap gap-2">
          {INDEX_KINDS.map((other) => (
            <li key={other}>
              <Link
                to="/catalog-index"
                search={{ kind: other }}
                aria-current={other === kind ? 'page' : undefined}
                className={buttonVariants({ variant: other === kind ? 'default' : 'outline' })}
              >
                {kindLabels[other]()}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-4">
        <ListSearchForm
          id="index-search"
          label={m.index_search_label()}
          submitLabel={m.index_search_submit()}
          query={q}
          onSearch={(query) => void navigate({ search: { kind, q: query, unused } })}
        />
        <Field orientation="horizontal">
          <Checkbox
            id="index-unused"
            checked={unused ?? false}
            onCheckedChange={(checked) =>
              void navigate({ search: { kind, q, unused: checked || undefined } })
            }
          />
          <FieldLabel htmlFor="index-unused">{m.index_unused_label()}</FieldLabel>
        </Field>
      </div>

      {/* Keyed by the list, so a selection never covers entries it no longer shows. */}
      <IndexEntries key={`${kind}:${unused ?? false}:${q ?? ''}`} search={{ kind, q, unused }} />
    </div>
  );
}
