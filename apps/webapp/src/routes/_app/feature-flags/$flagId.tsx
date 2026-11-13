import { Avatar, AvatarFallback, AvatarImage } from '@books/ui/components/avatar';
import { Button } from '@books/ui/components/button';
import { Checkbox } from '@books/ui/components/checkbox';
import { Field, FieldDescription, FieldError, FieldLabel } from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { Label } from '@books/ui/components/label';
import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import ErrorMessage from '#/components/ErrorMessage';
import PageSection from '#/components/PageSection';
import Pagination from '#/components/Pagination';
import { useServerAction } from '#/hooks/use-server-action';
import { m } from '#/paraglide/messages';
import {
  FLAG_DESCRIPTION_MAX_LENGTH,
  flagIdSchema,
  parseFlagDetailsSearch,
  selectionState,
} from '#/services/feature-flags/feature-flags';
import {
  deleteFeatureFlagFn,
  getFeatureFlagDetailsFn,
  grantFeatureFlagFn,
  revokeFeatureFlagFn,
  updateFeatureFlagFn,
} from '#/services/feature-flags/feature-flags.functions';
import { pageCount } from '#/services/user-management/user-management';
import { formatDate } from '#/utils/dates';
import { initialsOf } from '#/utils/names';

import type { FC, FormEvent, ReactNode } from 'react';

export const Route = createFileRoute('/_app/feature-flags/$flagId')({
  validateSearch: parseFlagDetailsSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    // Not a flag id at all: no such flag, rather than a validation error.
    const details = flagIdSchema.safeParse(params).success
      ? await getFeatureFlagDetailsFn({ data: { flagId: params.flagId, ...deps } })
      : null;

    if (!details) {
      throw notFound();
    }

    return details;
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.flag.key ?? m.flags_title() }] }),
  notFoundComponent: FlagNotFound,
  component: FlagPage,
});

type FlagDetails = NonNullable<Awaited<ReturnType<typeof getFeatureFlagDetailsFn>>>;

type ListedUser = { id: string; displayName: string | null; email: string; imageUrl: string };

const nameOf = (user: ListedUser) => user.displayName || user.email || m.users_unnamed();

const BackLink: FC = () => (
  <Link
    to="/feature-flags"
    className="text-link focus-visible:ring-ring focus-visible:ring-offset-background flex items-center gap-1.5 self-start rounded-sm text-base/6 underline-offset-3 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
  >
    <Icon icon="arrow-left" aria-hidden className="size-4.5" />
    {m.flag_back()}
  </Link>
);

type UserSelectionTableProps<User extends ListedUser> = {
  users: User[];
  selected: ReadonlySet<string>;
  onSelectedChange: (selected: Set<string>) => void;
  disabled: boolean;
  /** A second column, such as when the user was granted the flag. */
  detail?: { heading: string; render: (user: User) => ReactNode };
};

/** Users with a checkbox each, and one in the header that selects the whole page. */
function UserSelectionTable<User extends ListedUser>({
  users,
  selected,
  onSelectedChange,
  disabled,
  detail,
}: UserSelectionTableProps<User>) {
  const ids = users.map(({ id }) => id);
  const all = selectionState(selected, ids);

  const toggle = (id: string, checked: boolean) => {
    const next = new Set(selected);

    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }

    onSelectedChange(next);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-md text-left text-base/6">
        <thead className="border-rule border-b">
          <tr>
            <th scope="col" className="w-12 py-2 pr-4">
              <Checkbox
                aria-label={m.flag_select_all()}
                checked={all === true}
                indeterminate={all === 'some'}
                disabled={disabled}
                onCheckedChange={(checked) => onSelectedChange(checked ? new Set(ids) : new Set())}
              />
            </th>
            <th scope="col" className="text-muted-foreground py-2 pr-4 text-sm font-semibold">
              {m.users_column_user()}
            </th>
            {detail && (
              <th scope="col" className="text-muted-foreground py-2 text-sm font-semibold">
                {detail.heading}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const name = nameOf(user);

            return (
              <tr key={user.id} className="border-border border-b">
                <td className="py-3 pr-4">
                  <Checkbox
                    aria-label={m.flag_select_user({ name })}
                    checked={selected.has(user.id)}
                    disabled={disabled}
                    onCheckedChange={(checked) => toggle(user.id, checked)}
                  />
                </td>
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
                {detail && (
                  <td className="text-muted-foreground py-3 text-sm">{detail.render(user)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const SettingsSection: FC<{ flag: FlagDetails['flag'] }> = ({ flag }) => {
  const { pending, failed, run } = useServerAction();
  const [description, setDescription] = useState(flag.description ?? '');
  const [tooLong, setTooLong] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const long = description.trim().length > FLAG_DESCRIPTION_MAX_LENGTH;

    setTooLong(long);
    setSaved(false);

    if (!long) {
      setSaved(await run(() => updateFeatureFlagFn({ data: { flagId: flag.id, description } })));
    }
  };

  return (
    <PageSection
      id="flag-settings"
      title={m.flag_settings_heading()}
      description={m.flag_settings_description()}
    >
      {failed && <ErrorMessage>{m.user_action_failed()}</ErrorMessage>}
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <Field data-invalid={tooLong ? true : undefined}>
          <FieldLabel htmlFor="flag-description">{m.flags_description_label()}</FieldLabel>
          <Input
            id="flag-description"
            autoComplete="off"
            aria-invalid={tooLong ? true : undefined}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setSaved(false);
            }}
          />
          <FieldDescription>{m.flags_description_hint()}</FieldDescription>
          <FieldError>
            {tooLong && m.flags_description_too_long({ max: FLAG_DESCRIPTION_MAX_LENGTH })}
          </FieldError>
        </Field>
        <div className="flex flex-wrap-reverse items-center justify-end gap-4">
          <p role="status" className="text-forest text-ui flex items-center gap-2 empty:hidden">
            {saved && (
              <>
                <Icon icon="circle-check" aria-hidden className="size-5" />
                {m.flag_saved()}
              </>
            )}
          </p>
          <Button type="submit" disabled={pending}>
            <Icon icon="device-floppy" aria-hidden data-icon="inline-start" />
            {m.profile_save()}
          </Button>
        </div>
      </form>
    </PageSection>
  );
};

const HoldersSection: FC<{ details: FlagDetails }> = ({ details }) => {
  const { flag, holders } = details;
  const { page = 1, find, findPage } = Route.useSearch();
  const { pending, failed, run } = useServerAction();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const revoke = async () => {
    const userIds = [...selected];

    if (await run(() => revokeFeatureFlagFn({ data: { flagId: flag.id, userIds } }))) {
      setSelected(new Set());
    }
  };

  return (
    <PageSection
      id="flag-holders"
      title={m.flag_holders_heading({ count: holders.total })}
      description={m.flag_holders_description()}
    >
      {failed && <ErrorMessage>{m.user_action_failed()}</ErrorMessage>}
      {holders.users.length === 0 ? (
        <p className="text-muted-foreground text-base/6">{m.flag_holders_empty()}</p>
      ) : (
        <>
          <UserSelectionTable
            users={holders.users}
            selected={selected}
            onSelectedChange={setSelected}
            disabled={pending}
            detail={{
              heading: m.flag_column_granted(),
              render: (user) =>
                user.grantedBy
                  ? m.flag_granted_by({ date: formatDate(user.grantedAt), name: user.grantedBy })
                  : formatDate(user.grantedAt),
            }}
          />
          <Button
            variant="outline"
            className="self-start"
            disabled={pending || selected.size === 0}
            onClick={() => void revoke()}
          >
            <Icon icon="user-minus" aria-hidden data-icon="inline-start" />
            {m.flag_revoke_selected({ count: selected.size })}
          </Button>
        </>
      )}
      <Pagination
        label={m.flag_holders_pagination()}
        page={page}
        pages={pageCount(holders.total)}
        linkTo={(target) => ({
          to: '/feature-flags/$flagId',
          params: { flagId: flag.id },
          search: { page: target, find, findPage },
        })}
      />
    </PageSection>
  );
};

const GrantSection: FC<{ details: FlagDetails }> = ({ details }) => {
  const { flag, candidates } = details;
  const { page, find, findPage = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { pending, failed, run } = useServerAction();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('find');
    const query = typeof value === 'string' ? value.trim() : '';

    void navigate({ search: { page, find: query || undefined } });
  };

  const grant = async () => {
    const userIds = [...selected];

    if (await run(() => grantFeatureFlagFn({ data: { flagId: flag.id, userIds } }))) {
      setSelected(new Set());
    }
  };

  const empty = find ? m.flag_grant_empty_search({ query: find }) : m.flag_grant_empty();

  return (
    <PageSection
      id="flag-grant"
      title={m.flag_grant_heading()}
      description={m.flag_grant_description()}
    >
      <search>
        <form className="flex flex-col gap-2" onSubmit={handleSearch}>
          <Label htmlFor="flag-grant-search">{m.users_search_label()}</Label>
          <div className="flex max-w-lg gap-2">
            {/* Keyed by the query, so going back in history shows the matching text. */}
            <Input
              key={find}
              id="flag-grant-search"
              name="find"
              type="search"
              defaultValue={find ?? ''}
            />
            <Button type="submit" variant="outline">
              <Icon icon="search" aria-hidden data-icon="inline-start" />
              {m.users_search_submit()}
            </Button>
          </div>
        </form>
      </search>
      <h3 className="text-base/6 font-semibold">
        {find
          ? m.flag_grant_results_matching({ count: candidates.total, query: find })
          : m.flag_grant_results({ count: candidates.total })}
      </h3>
      {failed && <ErrorMessage>{m.user_action_failed()}</ErrorMessage>}
      {candidates.users.length === 0 ? (
        <p className="text-muted-foreground text-base/6">{empty}</p>
      ) : (
        <>
          <UserSelectionTable
            users={candidates.users}
            selected={selected}
            onSelectedChange={setSelected}
            disabled={pending}
          />
          <Button
            variant="secondary"
            className="self-start"
            disabled={pending || selected.size === 0}
            onClick={() => void grant()}
          >
            <Icon icon="user-plus" aria-hidden data-icon="inline-start" />
            {m.flag_grant_selected({ count: selected.size })}
          </Button>
        </>
      )}
      <Pagination
        label={m.flag_grant_pagination()}
        page={findPage}
        pages={pageCount(candidates.total)}
        linkTo={(target) => ({
          to: '/feature-flags/$flagId',
          params: { flagId: flag.id },
          search: { page, find, findPage: target },
        })}
      />
    </PageSection>
  );
};

const DeleteSection: FC<{ flag: FlagDetails['flag'] }> = ({ flag }) => {
  const navigate = useNavigate();
  const { pending, failed, run } = useServerAction();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (await run(() => deleteFeatureFlagFn({ data: { flagId: flag.id } }))) {
      await navigate({ to: '/feature-flags' });
    }
  };

  return (
    <section
      aria-labelledby="flag-delete"
      className="border-destructive flex flex-col gap-4 rounded-md border px-5 py-4"
    >
      <div className="flex flex-col gap-1">
        <h2 id="flag-delete" className="text-heading-3 text-destructive flex items-center gap-2">
          <Icon icon="alert-triangle" aria-hidden className="size-5 shrink-0" />
          {m.flag_delete_heading()}
        </h2>
        <p className="text-muted-foreground text-base/6">{m.flag_delete_description()}</p>
      </div>
      {failed && <ErrorMessage>{m.user_action_failed()}</ErrorMessage>}
      {confirming ? (
        <div className="flex flex-col gap-3">
          <p className="text-base/6 font-semibold break-all" id="flag-delete-confirm">
            {m.flag_delete_confirm({ key: flag.key })}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="destructive"
              aria-describedby="flag-delete-confirm"
              disabled={pending}
              onClick={() => void handleDelete()}
            >
              <Icon icon="trash" aria-hidden data-icon="inline-start" />
              {m.flag_delete_confirm_button()}
            </Button>
            <Button variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
              {m.flag_delete_cancel()}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="destructive" className="self-start" onClick={() => setConfirming(true)}>
          <Icon icon="trash" aria-hidden data-icon="inline-start" />
          {m.flag_delete()}
        </Button>
      )}
    </section>
  );
};

function FlagNotFound() {
  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
      <BackLink />
      <h1>{m.flag_not_found_title()}</h1>
      <p className="text-muted-foreground">{m.flag_not_found_description()}</p>
    </div>
  );
}

function FlagPage() {
  const details = Route.useLoaderData();
  const { page, find, findPage } = Route.useSearch();
  const { flag } = details;

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-12 px-4 py-16">
      <div className="flex flex-col gap-6">
        <BackLink />
        <header className="flex flex-col gap-2">
          <p className="text-overline text-muted-foreground uppercase">{m.flag_overline()}</p>
          <h1 className="break-all">{flag.key}</h1>
          <span aria-hidden className="bg-gilt h-0.5 w-16" />
          {flag.description && <p className="mt-1 text-base/6">{flag.description}</p>}
          <p className="text-muted-foreground">
            {m.flag_created_on({ date: formatDate(flag.createdAt) })}
          </p>
        </header>
      </div>

      {/* Keyed by the flag, so the form starts from its saved description on another flag. */}
      <SettingsSection key={flag.id} flag={flag} />
      {/* Keyed by the list's page, so a selection never covers users no longer shown. */}
      <HoldersSection key={`${flag.id}:${page ?? 1}`} details={details} />
      <GrantSection key={`${flag.id}:${find ?? ''}:${findPage ?? 1}`} details={details} />
      <DeleteSection flag={flag} />
    </div>
  );
}
