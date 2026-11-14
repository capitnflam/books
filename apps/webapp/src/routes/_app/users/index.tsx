import { Avatar, AvatarFallback, AvatarImage } from '@books/ui/components/avatar';
import { Button } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { Label } from '@books/ui/components/label';
import { Link, createFileRoute } from '@tanstack/react-router';

import Pagination from '#/components/Pagination';
import { m } from '#/paraglide/messages';
import { pageCount, parseUserListSearch } from '#/services/user-management/user-management';
import { listUsersFn } from '#/services/user-management/user-management.functions';
import { formatDate } from '#/utils/dates';
import { initialsOf } from '#/utils/names';

import type { IconName } from '@books/ui/components/icon';
import type { FC, FormEvent } from 'react';

export const Route = createFileRoute('/_app/users/')({
  validateSearch: parseUserListSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => listUsersFn({ data: deps }),
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

const UserRow: FC<{ user: ListedUser }> = ({ user }) => {
  const name = user.displayName || user.email || m.users_unnamed();

  return (
    <tr className="border-border border-b">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.imageUrl || undefined} alt="" />
            <AvatarFallback>{initialsOf(name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <Link
              to="/users/$userId"
              params={{ userId: user.id }}
              className="text-link focus-visible:ring-ring focus-visible:ring-offset-background truncate rounded-sm font-semibold underline-offset-3 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {name}
            </Link>
            {user.email && user.email !== name && (
              <span className="text-muted-foreground truncate text-sm">{user.email}</span>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 pr-4">
        {user.role ? (
          <span className="bg-accent text-accent-foreground inline-block rounded-sm px-2 py-0.5 text-sm font-medium first-letter:uppercase">
            {user.role.name}
          </span>
        ) : (
          <span className="text-muted-foreground">{m.users_no_role()}</span>
        )}
      </td>
      <td className="py-3 pr-4">
        <span
          className="data-[status=active]:text-forest data-[status=blocked]:text-destructive text-muted-foreground flex items-center gap-1.5 text-sm font-medium"
          data-status={user.status}
        >
          <Icon icon={statusDisplay[user.status].icon} aria-hidden className="size-4 shrink-0" />
          {statusDisplay[user.status].label()}
        </span>
      </td>
      <td className="text-muted-foreground py-3 text-sm whitespace-nowrap">
        {formatDate(user.createdAt)}
      </td>
    </tr>
  );
};

function UsersPage() {
  const { users, total } = Route.useLoaderData();
  const { q, page = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();
  const pages = pageCount(total);

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
          <div className="overflow-x-auto">
            <table className="w-full min-w-xl text-left text-base/6">
              <thead className="border-rule border-b">
                <tr>
                  <th scope="col" className="text-muted-foreground py-2 pr-4 text-sm font-semibold">
                    {m.users_column_user()}
                  </th>
                  <th scope="col" className="text-muted-foreground py-2 pr-4 text-sm font-semibold">
                    {m.users_column_role()}
                  </th>
                  <th scope="col" className="text-muted-foreground py-2 pr-4 text-sm font-semibold">
                    {m.users_column_status()}
                  </th>
                  <th scope="col" className="text-muted-foreground py-2 text-sm font-semibold">
                    {m.users_column_joined()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          label={m.users_pagination()}
          page={page}
          pages={pages}
          linkTo={(target) => ({ to: '/users', search: { q, page: target } })}
        />
      </section>
    </div>
  );
}
