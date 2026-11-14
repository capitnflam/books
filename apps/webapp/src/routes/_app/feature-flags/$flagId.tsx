import { Button } from '@books/ui/components/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { Label } from '@books/ui/components/label';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import ErrorMessage from '#/components/ErrorMessage';
import PageSection from '#/components/PageSection';
import UserCell from '#/components/UserCell';
import { VirtualTable } from '#/components/VirtualTable';
import { useServerAction } from '#/hooks/use-server-action';
import { m } from '#/paraglide/messages';
import {
  FLAG_DESCRIPTION_MAX_LENGTH,
  flagIdSchema,
  inBulkBatches,
  parseFlagDetailsSearch,
} from '#/services/feature-flags/feature-flags';
import {
  deleteFeatureFlagFn,
  getFeatureFlagFn,
  grantFeatureFlagFn,
  listFlagCandidatesFn,
  listFlagHoldersFn,
  revokeFeatureFlagFn,
  updateFeatureFlagFn,
} from '#/services/feature-flags/feature-flags.functions';
import { nextPage } from '#/services/user-management/user-management';
import { formatDate } from '#/utils/dates';

import type { VirtualTableColumn } from '#/components/VirtualTable';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import type { FC, FormEvent } from 'react';

/** Every query of a flag's lists, refreshed together after a grant or a take-back. */
const flagListsKey = (flagId: string) => ['feature-flag-users', flagId] as const;

/** The users who have the flag, loaded a page at a time as the list scrolls. */
const holdersQuery = (flagId: string) =>
  infiniteQueryOptions({
    queryKey: [...flagListsKey(flagId), 'holders'],
    queryFn: ({ pageParam }) => listFlagHoldersFn({ data: { flagId, page: pageParam } }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => nextPage(pages.length, last.total),
  });

/** The users the flag can be granted to, found by name, loaded as the list scrolls. */
const candidatesQuery = (flagId: string, q: string | undefined) =>
  infiniteQueryOptions({
    queryKey: [...flagListsKey(flagId), 'candidates', { q }],
    queryFn: ({ pageParam }) => listFlagCandidatesFn({ data: { flagId, q, page: pageParam } }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => nextPage(pages.length, last.total),
  });

export const Route = createFileRoute('/_app/feature-flags/$flagId')({
  validateSearch: parseFlagDetailsSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    // Not a flag id at all: no such flag, rather than a validation error.
    const flag = flagIdSchema.safeParse(params).success
      ? await getFeatureFlagFn({ data: { flagId: params.flagId } })
      : null;

    if (!flag) {
      throw notFound();
    }

    // The first page of each list renders on the server; the rest load as they scroll.
    await Promise.all([
      context.queryClient.ensureInfiniteQueryData(holdersQuery(flag.id)),
      context.queryClient.ensureInfiniteQueryData(candidatesQuery(flag.id, deps.find)),
    ]);

    return flag;
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.key ?? m.flags_title() }] }),
  notFoundComponent: FlagNotFound,
  component: FlagPage,
});

type Flag = NonNullable<Awaited<ReturnType<typeof getFeatureFlagFn>>>;

type Holder = Awaited<ReturnType<typeof listFlagHoldersFn>>['users'][number];

type Candidate = Awaited<ReturnType<typeof listFlagCandidatesFn>>['users'][number];

const nameOf = (user: Candidate | undefined) =>
  user?.displayName || user?.email || m.users_unnamed();

const holderColumns: VirtualTableColumn<Holder>[] = [
  { id: 'user', header: m.users_column_user, cell: (user) => <UserCell user={user} /> },
  {
    id: 'granted',
    header: m.flag_column_granted,
    cell: (user) =>
      user.grantedBy
        ? m.flag_granted_by({ date: formatDate(user.grantedAt), name: user.grantedBy })
        : formatDate(user.grantedAt),
    className: 'text-muted-foreground text-sm',
  },
];

const candidateColumns: VirtualTableColumn<Candidate>[] = [
  { id: 'user', header: m.users_column_user, cell: (user) => <UserCell user={user} /> },
];

/** The rows an infinite list has loaded so far, how many there are, and how to load more. */
function loadedRows<Row>(
  query: UseInfiniteQueryResult<InfiniteData<{ total: number; users: Row[] }>>,
) {
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = query;

  return {
    rows: data?.pages.flatMap((page) => page.users) ?? [],
    total: data?.pages[0]?.total ?? 0,
    hasMore: hasNextPage,
    loadingMore: isFetchingNextPage,
    loadFailed: isFetchNextPageError,
    loadMore: () => void fetchNextPage(),
  };
}

const BackLink: FC = () => (
  <Link
    to="/feature-flags"
    className="text-link focus-visible:ring-ring focus-visible:ring-offset-background flex items-center gap-1.5 self-start rounded-sm text-base/6 underline-offset-3 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
  >
    <Icon icon="arrow-left" aria-hidden className="size-4.5" />
    {m.flag_back()}
  </Link>
);

const SettingsSection: FC<{ flag: Flag }> = ({ flag }) => {
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

const HoldersSection: FC<{ flag: Flag }> = ({ flag }) => {
  const list = loadedRows(useInfiniteQuery(holdersQuery(flag.id)));
  const { pending, failed, run } = useServerAction(flagListsKey(flag.id));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const byId = new Map(list.rows.map((user) => [user.id, user]));

  const revoke = async () => {
    const batches = inBulkBatches([...selected]);
    const done = await run(async () => {
      for (const userIds of batches) {
        await revokeFeatureFlagFn({ data: { flagId: flag.id, userIds } });
      }
    });

    if (done) {
      setSelected(new Set());
    }
  };

  return (
    <PageSection
      id="flag-holders"
      title={m.flag_holders_heading({ count: list.total })}
      description={m.flag_holders_description()}
    >
      {failed && <ErrorMessage>{m.user_action_failed()}</ErrorMessage>}
      {list.rows.length === 0 ? (
        <p className="text-muted-foreground text-base/6">{m.flag_holders_empty()}</p>
      ) : (
        <>
          <VirtualTable
            label={m.flag_holders_label()}
            columns={holderColumns}
            {...list}
            selection={{
              selected,
              onSelectedChange: setSelected,
              disabled: pending,
              rowLabel: (id) => m.flag_select_user({ name: nameOf(byId.get(id)) }),
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
    </PageSection>
  );
};

const GrantSection: FC<{ flag: Flag }> = ({ flag }) => {
  const { find } = Route.useSearch();
  const navigate = Route.useNavigate();
  const list = loadedRows(useInfiniteQuery(candidatesQuery(flag.id, find)));
  const { pending, failed, run } = useServerAction(flagListsKey(flag.id));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const byId = new Map(list.rows.map((user) => [user.id, user]));

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('find');
    const query = typeof value === 'string' ? value.trim() : '';

    // Searching keeps the scroll where it is: the list is further down the page.
    void navigate({ search: { find: query || undefined }, resetScroll: false });
  };

  const grant = async () => {
    const batches = inBulkBatches([...selected]);
    const done = await run(async () => {
      for (const userIds of batches) {
        await grantFeatureFlagFn({ data: { flagId: flag.id, userIds } });
      }
    });

    if (done) {
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
          ? m.flag_grant_results_matching({ count: list.total, query: find })
          : m.flag_grant_results({ count: list.total })}
      </h3>
      {failed && <ErrorMessage>{m.user_action_failed()}</ErrorMessage>}
      {list.rows.length === 0 ? (
        <p className="text-muted-foreground text-base/6">{empty}</p>
      ) : (
        <>
          <VirtualTable
            label={m.flag_grant_label()}
            columns={candidateColumns}
            {...list}
            selection={{
              selected,
              onSelectedChange: setSelected,
              disabled: pending,
              rowLabel: (id) => m.flag_select_user({ name: nameOf(byId.get(id)) }),
            }}
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
    </PageSection>
  );
};

const DeleteSection: FC<{ flag: Flag }> = ({ flag }) => {
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
  const flag = Route.useLoaderData();
  const { find } = Route.useSearch();

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
      <HoldersSection key={flag.id} flag={flag} />
      {/* Keyed by the search, so a selection never covers users the search no longer shows. */}
      <GrantSection key={`${flag.id}:${find ?? ''}`} flag={flag} />
      <DeleteSection flag={flag} />
    </div>
  );
}
