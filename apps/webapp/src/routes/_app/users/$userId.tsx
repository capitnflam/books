import { Avatar, AvatarFallback, AvatarImage } from '@books/ui/components/avatar';
import { Button } from '@books/ui/components/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { Link, createFileRoute, notFound, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import ErrorMessage from '#/components/ErrorMessage';
import PageSection from '#/components/PageSection';
import { useServerAction } from '#/hooks/use-server-action';
import { m } from '#/paraglide/messages';
import { DISPLAY_NAME_MAX_LENGTH, displayNameSchema } from '#/services/profile/profile';
import { userIdSchema } from '#/services/user-management/user-management';
import {
  deleteUserFn,
  getUserDetailsFn,
  setRoleFn,
  setUserBlockedFn,
  updateUserDisplayNameFn,
} from '#/services/user-management/user-management.functions';
import { formatDate } from '#/utils/dates';
import { initialsOf } from '#/utils/names';
import { permissionLabel } from '#/utils/permission-labels';

import type { FC, FormEvent } from 'react';

export const Route = createFileRoute('/_app/users/$userId')({
  loader: async ({ params }) => {
    // Not a user id at all: no such user, rather than a validation error.
    const details = userIdSchema.safeParse(params).success
      ? await getUserDetailsFn({ data: { userId: params.userId } })
      : null;

    if (!details) {
      throw notFound();
    }

    return details;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? nameOf(loaderData) : m.users_title() }],
  }),
  notFoundComponent: UserNotFound,
  component: UserPage,
});

type UserDetails = NonNullable<Awaited<ReturnType<typeof getUserDetailsFn>>>;

function nameOf({ user, account }: UserDetails) {
  return user.displayName || account?.fullName || account?.email || m.users_unnamed();
}

const BackLink: FC = () => (
  <Link
    to="/users"
    className="text-link focus-visible:ring-ring focus-visible:ring-offset-background flex items-center gap-1.5 self-start rounded-sm text-base/6 underline-offset-3 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
  >
    <Icon icon="arrow-left" aria-hidden className="size-4.5" />
    {m.user_back()}
  </Link>
);

type DisplayNameFormProps = { userId: string; displayName: string };

const DisplayNameForm: FC<DisplayNameFormProps> = ({ userId, displayName }) => {
  const router = useRouter();
  const [value, setValue] = useState(displayName);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = displayNameSchema.safeParse({ displayName: value });

    if (!parsed.success) {
      setError(
        value.trim()
          ? m.profile_display_name_too_long({ max: DISPLAY_NAME_MAX_LENGTH })
          : m.profile_display_name_required(),
      );
      setStatus('idle');

      return;
    }

    setError(undefined);
    setStatus('saving');

    try {
      await updateUserDisplayNameFn({ data: { userId, ...parsed.data } });
      setValue(parsed.data.displayName);
      setStatus('saved');
      await router.invalidate();
    } catch {
      setStatus('failed');
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <FieldSet>
        <FieldLegend>{m.user_details_legend()}</FieldLegend>
        <FieldDescription>{m.user_details_description()}</FieldDescription>
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="user-display-name">{m.profile_display_name_label()}</FieldLabel>
            <Input
              id="user-display-name"
              autoComplete="off"
              className="max-w-sm"
              aria-invalid={error ? true : undefined}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setStatus('idle');
              }}
            />
            <FieldError>{error}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>
      <div className="flex flex-wrap-reverse items-center justify-end gap-4">
        <p role="status" className="text-forest text-ui flex items-center gap-2 empty:hidden">
          {status === 'saved' && (
            <>
              <Icon icon="circle-check" aria-hidden className="size-5" />
              {m.user_saved()}
            </>
          )}
        </p>
        {status === 'failed' && <FieldError>{m.user_action_failed()}</FieldError>}
        <Button type="submit" disabled={status === 'saving'}>
          <Icon icon="device-floppy" aria-hidden data-icon="inline-start" />
          {m.profile_save()}
        </Button>
      </div>
    </form>
  );
};

type RoleSectionProps = { details: UserDetails; name: string };

const RoleSection: FC<RoleSectionProps> = ({ details, name }) => {
  const { pending, failed, run } = useServerAction();
  const { user, role: current, allRoles, isSelf, can } = details;
  const editable = can.manageRoles && !isSelf;
  // Editing lists every role, the current one first; otherwise only the current one.
  const others = editable ? allRoles.filter((role) => role.id !== current?.id) : [];

  let description = m.user_role_description_read_only();

  if (isSelf && can.manageRoles) {
    description = m.user_role_description_self();
  } else if (editable) {
    description = m.user_role_description_edit();
  }

  const setRole = (roleId: string) =>
    void run(() => setRoleFn({ data: { userId: user.id, roleId } }));

  return (
    <PageSection id="user-role" title={m.role_heading()} description={description}>
      {failed && <ErrorMessage>{m.user_action_failed()}</ErrorMessage>}
      {current ? (
        <div className="bg-card shadow-page border-border flex flex-col gap-3 rounded-md border px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-col gap-0.5">
              <h3 className="first-letter:uppercase">{current.name}</h3>
              <p className="text-muted-foreground text-sm">
                {current.grantedBy
                  ? m.user_role_granted_by({
                      date: formatDate(current.grantedAt),
                      name: current.grantedBy,
                    })
                  : m.profile_role_granted_on({ date: formatDate(current.grantedAt) })}
              </p>
            </div>
          </div>
          {current.description && (
            <p className="text-muted-foreground text-base/6">{current.description}</p>
          )}
          {current.permissions.length > 0 && (
            <ul
              aria-label={m.profile_role_permissions({ role: current.name })}
              className="grid gap-x-6 gap-y-2 text-base/6 sm:grid-cols-2"
            >
              {current.permissions.map((permission) => (
                <li key={permission} className="flex items-center gap-2">
                  <Icon icon="check" aria-hidden className="text-forest size-4.5 shrink-0" />
                  {permissionLabel(permission)}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-base/6">{m.user_role_empty({ name })}</p>
      )}
      {others.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 id="user-other-roles" className="text-base/6 font-semibold">
            {current ? m.user_role_others_switch() : m.user_role_others_assign()}
          </h3>
          <ul aria-labelledby="user-other-roles" className="border-border flex flex-col border-t">
            {others.map((role) => (
              <li
                key={role.id}
                className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 border-b py-3.5"
              >
                <div className="flex min-w-0 flex-1 basis-64 flex-col">
                  <span className="text-base/6 font-semibold first-letter:uppercase">
                    {role.name}
                  </span>
                  {role.description && (
                    <span className="text-muted-foreground text-sm">{role.description}</span>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pending}
                  onClick={() => setRole(role.id)}
                >
                  <Icon
                    icon={current ? 'switch-horizontal' : 'plus'}
                    aria-hidden
                    data-icon="inline-start"
                  />
                  {current
                    ? m.user_role_switch({ role: role.name })
                    : m.user_role_assign({ role: role.name })}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageSection>
  );
};

type AccountSectionProps = { details: UserDetails; name: string };

const AccountSection: FC<AccountSectionProps> = ({ details, name }) => {
  const navigate = useNavigate();
  const { pending, failed, run } = useServerAction();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { user, account } = details;
  const blocked = account?.blocked ?? false;

  const handleDelete = async () => {
    if (await run(() => deleteUserFn({ data: { userId: user.id } }))) {
      await navigate({ to: '/users' });
    }
  };

  return (
    <PageSection
      id="user-account"
      title={m.user_account_heading()}
      description={m.user_account_description()}
    >
      {failed && <ErrorMessage>{m.user_action_failed()}</ErrorMessage>}
      <div className="flex flex-col gap-6">
        {account && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-base/6">
              {blocked ? m.user_block_explain_blocked() : m.user_block_explain_active()}
            </p>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() =>
                void run(() => setUserBlockedFn({ data: { userId: user.id, blocked: !blocked } }))
              }
            >
              <Icon icon={blocked ? 'lock-open' : 'ban'} aria-hidden data-icon="inline-start" />
              {blocked ? m.user_unblock() : m.user_block()}
            </Button>
          </div>
        )}
        <div className="border-destructive flex flex-col gap-4 rounded-md border px-5 py-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-destructive flex items-center gap-2">
              <Icon icon="alert-triangle" aria-hidden className="size-5 shrink-0" />
              {m.user_delete_heading()}
            </h3>
            <p className="text-muted-foreground text-base/6">{m.user_delete_description()}</p>
          </div>
          {confirmingDelete ? (
            <div className="flex flex-col gap-3">
              <p className="text-base/6 font-semibold" id="user-delete-confirm">
                {m.user_delete_confirm({ name })}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="destructive"
                  aria-describedby="user-delete-confirm"
                  disabled={pending}
                  onClick={() => void handleDelete()}
                >
                  <Icon icon="trash" aria-hidden data-icon="inline-start" />
                  {m.user_delete_confirm_button()}
                </Button>
                <Button
                  variant="ghost"
                  disabled={pending}
                  onClick={() => setConfirmingDelete(false)}
                >
                  {m.user_delete_cancel()}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="destructive"
              className="self-start"
              onClick={() => setConfirmingDelete(true)}
            >
              <Icon icon="trash" aria-hidden data-icon="inline-start" />
              {m.user_delete()}
            </Button>
          )}
        </div>
      </div>
    </PageSection>
  );
};

function UserNotFound() {
  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
      <BackLink />
      <h1>{m.user_not_found_title()}</h1>
      <p className="text-muted-foreground">{m.user_not_found_description()}</p>
    </div>
  );
}

function UserPage() {
  const details = Route.useLoaderData();
  const { user, account, isSelf, can } = details;
  const name = nameOf(details);

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-12 px-4 py-16">
      <div className="flex flex-col gap-6">
        <BackLink />
        <header className="flex flex-wrap items-center gap-x-8 gap-y-6">
          <Avatar className="ring-gilt ring-offset-background size-28 ring-1 ring-offset-4">
            <AvatarImage src={account?.imageUrl || undefined} alt="" />
            <AvatarFallback className="font-heading text-[44px]">{initialsOf(name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 basis-80 flex-col gap-2">
            <p className="text-overline text-muted-foreground uppercase">
              {isSelf ? m.user_overline_self() : m.user_overline()}
            </p>
            <h1 className="break-words">{name}</h1>
            <span aria-hidden className="bg-gilt h-0.5 w-16" />
            <p className="text-muted-foreground mt-1">
              {account?.email && <>{account.email} · </>}
              {m.profile_reader_since({ date: formatDate(user.createdAt) })}
            </p>
            <p className="text-muted-foreground">
              {account?.lastSignInAt
                ? m.user_last_sign_in({ date: formatDate(account.lastSignInAt) })
                : m.user_never_signed_in()}
            </p>
            {account?.blocked && (
              <p className="text-destructive mt-1 flex items-center gap-1.5 text-base/6 font-medium">
                <Icon icon="ban" aria-hidden className="size-4.5 shrink-0" />
                {m.user_blocked_notice()}
              </p>
            )}
          </div>
        </header>
        {!account && <ErrorMessage>{m.user_no_account()}</ErrorMessage>}
      </div>

      {can.manageUser && (
        <DisplayNameForm
          key={user.id}
          userId={user.id}
          displayName={user.displayName ?? account?.fullName ?? ''}
        />
      )}

      <RoleSection details={details} name={name} />

      {can.manageUser && !isSelf && <AccountSection details={details} name={name} />}
    </div>
  );
}
