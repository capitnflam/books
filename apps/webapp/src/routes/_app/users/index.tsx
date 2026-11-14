import { Button } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { Label } from '@books/ui/components/label';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import UserCell from '#/components/UserCell';
import { VirtualTable } from '#/components/VirtualTable';
import { m } from '#/paraglide/messages';
import { nextPage, parseUserListSearch } from '#/services/user-management/user-management';
import { listUsersFn } from '#/services/user-management/user-management.functions';
import { formatDate } from '#/utils/dates';

import type { VirtualTableColumn } from '#/components/VirtualTable';
import type { IconName } from '@books/ui/components/icon';
import type { FormEvent } from 'react';

/** The user list, loaded a page at a time as it scrolls. */
const usersQuery = (q: string | undefined) =>
  infiniteQueryOptions({
    queryKey: ['users', { q }],
    queryFn: ({ pageParam }) => listUsersFn({ data: { q, page: pageParam } }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => nextPage(pages.length, last.total),
  });

export const Route = createFileRoute('/_app/users/')({
  validateSearch: parseUserListSearch,
  loaderDeps: ({ search }) => search,
  // The first page renders on the server; the rest load in the browser as the list scrolls.
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureInfiniteQueryData(usersQuery(deps.q));
  },
  head: () => ({ meta: [{ title: m.users_title() }] }),
  component: UsersPage,
});

type ListedUser = Awaited<ReturnType<typeof listUsersFn>>['users'][number];

const statusDisplay: Record<ListedUser['status'], { icon: IconName; label: () => string }> = {
  active: { icon: 'circle-check', label: m.users_status_active },
  blocked: { icon: 'ban', label: m.users_status_blocked },
  'no-account': { icon: 'user-off', label: m.users_status_no_account },
  unknown: { icon: 'help-circle', label: m.users_status_unknown },
};

const columns: VirtualTableColumn<ListedUser>[] = [
  { id: 'user', header: m.users_column_user, cell: (user) => <UserCell user={user} /> },
  {
    id: 'role',
    header: m.users_column_role,
    cell: (user) =>
      user.role ? (
        <span className="bg-accent text-accent-foreground inline-block rounded-sm px-2 py-0.5 text-sm font-medium first-letter:uppercase">
          {user.role.name}
        </span>
      ) : (
        <span className="text-muted-foreground">{m.users_no_role()}</span>
      ),
  },
  {
    id: 'status',
    header: m.users_column_status,
    cell: (user) => (
      <span
        className="data-[status=active]:text-forest data-[status=blocked]:text-destructive text-muted-foreground flex items-center gap-1.5 text-sm font-medium"
        data-status={user.status}
      >
        <Icon icon={statusDisplay[user.status].icon} aria-hidden className="size-4 shrink-0" />
        {statusDisplay[user.status].label()}
      </span>
    ),
  },
  {
    id: 'joined',
    header: m.users_column_joined,
    cell: (user) => formatDate(user.createdAt),
    className: 'text-muted-foreground text-sm whitespace-nowrap',
  },
];

function UsersPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useInfiniteQuery(usersQuery(q));
  const users = data?.pages.flatMap((page) => page.users) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q');
    const query = typeof value === 'string' ? value.trim() : '';

    void navigate({ search: { q: query || undefined } });
  };

  return (
    <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-4 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-overline text-muted-foreground uppercase">{m.nav_group_admin()}</p>
        <h1>{m.users_title()}</h1>
        <span aria-hidden className="bg-gilt h-0.5 w-16" />
        <p className="text-muted-foreground mt-1">{m.users_intro()}</p>
      </header>

      <search>
        <form className="flex flex-col gap-2" onSubmit={handleSearch}>
          <Label htmlFor="users-search">{m.users_search_label()}</Label>
          <div className="flex max-w-lg gap-2">
            {/* Keyed by the query, so going back in history shows the matching text. */}
            <Input key={q} id="users-search" name="q" type="search" defaultValue={q ?? ''} />
            <Button type="submit" variant="outline">
              <Icon icon="search" aria-hidden data-icon="inline-start" />
              {m.users_search_submit()}
            </Button>
          </div>
        </form>
      </search>

      <section aria-labelledby="users-results" className="flex flex-col gap-4">
        <h2 id="users-results" className="text-heading-3 border-rule border-b pb-1.5">
          {q
            ? m.users_results_matching({ count: total, query: q })
            : m.users_results({ count: total })}
        </h2>

        {users.length === 0 ? (
          <p className="text-muted-foreground text-base/6">
            {q ? m.users_empty_search({ query: q }) : m.users_empty()}
          </p>
        ) : (
          <VirtualTable
            label={m.users_title()}
            rows={users}
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
