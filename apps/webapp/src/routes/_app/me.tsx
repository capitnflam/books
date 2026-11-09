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
  FieldTitle,
} from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { useClerk, useUser } from '@clerk/tanstack-react-start';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import { m } from '#/paraglide/messages';
import { getLocale, localizeHref, locales, setLocale } from '#/paraglide/runtime';
import { checkIsAuthenticatedFn } from '#/services/authentication/authentication.functions';
import { DISPLAY_NAME_MAX_LENGTH, displayNameSchema } from '#/services/profile/profile';
import { getProfileFn, updateDisplayNameFn } from '#/services/profile/profile.functions';
import { initialsOf, localeName } from '#/utils/names';

import type { Permission } from '@books/database';
import type { FC, FormEvent, ReactNode } from 'react';

export const Route = createFileRoute('/_app/me')({
  beforeLoad: async ({ location }) => {
    // location.href has the locale prefix stripped by the router rewrite; add it
    // back so signing in returns to the page in the current locale.
    await checkIsAuthenticatedFn({ data: { redirect_url: localizeHref(location.href) } });
  },
  loader: async () => ({ profile: await getProfileFn() }),
  head: () => ({ meta: [{ title: m.profile_title() }] }),
  component: ProfilePage,
});

// A Record over Permission, so adding a permission fails the type check until it has a label.
const permissionLabels: Record<Permission, () => string> = {
  'collection:manage': m.permission_collection_manage,
  'catalog:manage': m.permission_catalog_manage,
  'users:read': m.permission_users_read,
  'users:manage': m.permission_users_manage,
  'roles:manage': m.permission_roles_manage,
  'user-roles:manage': m.permission_user_roles_manage,
  'feature-flags:manage': m.permission_feature_flags_manage,
};

// Rows may still hold a permission removed from the code: show its identifier rather than fail.
const permissionLabel = (permission: string) =>
  Object.hasOwn(permissionLabels, permission)
    ? permissionLabels[permission as Permission]()
    : permission;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long' }).format(date);

type SectionProps = { id: string; title: string; description?: string; children: ReactNode };

/** A read-only section, titled like a form legend: heading-3 over a rule. */
const Section: FC<SectionProps> = ({ id, title, description, children }) => (
  <section aria-labelledby={id} className="flex flex-col gap-4">
    <div className="flex flex-col gap-2.5">
      <h2 id={id} className="text-heading-3 border-rule border-b pb-1.5">
        {title}
      </h2>
      {description && <p className="text-muted-foreground text-base/6">{description}</p>}
    </div>
    {children}
  </section>
);

type DisplayNameFormProps = { displayName: string; email: string };

const DisplayNameForm: FC<DisplayNameFormProps> = ({ displayName, email }) => {
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
      await updateDisplayNameFn({ data: parsed.data });
      setValue(parsed.data.displayName);
      setStatus('saved');
      // Reload the loaders, so the page title and the home greeting use the new name.
      await router.invalidate();
    } catch {
      setStatus('failed');
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <FieldSet>
        <FieldLegend>{m.profile_details_legend()}</FieldLegend>
        <FieldDescription>{m.profile_details_description()}</FieldDescription>
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="profile-display-name">{m.profile_display_name_label()}</FieldLabel>
            <Input
              id="profile-display-name"
              autoComplete="name"
              className="max-w-sm"
              aria-invalid={error ? true : undefined}
              aria-describedby="profile-display-name-hint"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setStatus('idle');
              }}
            />
            <FieldDescription id="profile-display-name-hint">
              {m.profile_display_name_hint()}
            </FieldDescription>
            <FieldError>{error}</FieldError>
          </Field>
          {email && (
            <Field>
              <FieldLabel htmlFor="profile-email">{m.profile_email_label()}</FieldLabel>
              <Input
                id="profile-email"
                type="email"
                className="max-w-sm"
                aria-describedby="profile-email-hint"
                value={email}
                disabled
                readOnly
              />
              <FieldDescription id="profile-email-hint">{m.profile_email_hint()}</FieldDescription>
            </Field>
          )}
        </FieldGroup>
      </FieldSet>
      <div className="flex flex-wrap-reverse items-center justify-end gap-4">
        <p role="status" className="text-forest text-ui flex items-center gap-2 empty:hidden">
          {status === 'saved' && (
            <>
              <Icon icon="circle-check" aria-hidden className="size-5" />
              {m.profile_saved()}
            </>
          )}
        </p>
        {status === 'failed' && <FieldError>{m.profile_save_failed()}</FieldError>}
        <Button type="submit" disabled={status === 'saving'}>
          <Icon icon="device-floppy" aria-hidden data-icon="inline-start" />
          {m.profile_save()}
        </Button>
      </div>
    </form>
  );
};

function ProfilePage() {
  const { profile } = Route.useLoaderData();
  const { user: clerkUser } = useUser();
  const { openUserProfile, signOut } = useClerk();

  // beforeLoad has already sent anyone signed out to the sign-in page.
  if (!profile) {
    return null;
  }

  const { user, account, roles, featureFlags } = profile;
  // Clerk's values once it has loaded, so a new picture shows without a reload; the server's before.
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? account.email;
  const fullName = clerkUser?.fullName ?? account.fullName;
  const name = user.displayName || fullName || email;
  const currentLocale = getLocale();

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-12 px-4 py-16">
      <header className="flex flex-wrap items-center gap-x-8 gap-y-6">
        <Avatar className="ring-gilt ring-offset-background size-28 ring-1 ring-offset-4">
          <AvatarImage src={clerkUser?.imageUrl ?? account.imageUrl} alt="" />
          <AvatarFallback className="font-heading text-[44px]">{initialsOf(name)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 basis-80 flex-col gap-2">
          <p className="text-overline text-muted-foreground uppercase">{m.profile_overline()}</p>
          <h1 className="break-words">{name}</h1>
          <span aria-hidden className="bg-gilt h-0.5 w-16" />
          <p className="text-muted-foreground mt-1">
            {email && <>{email} · </>}
            {m.profile_reader_since({ date: formatDate(user.createdAt) })}
          </p>
          {roles.length > 0 && (
            <ul aria-label={m.profile_roles_heading()} className="mt-1 flex flex-wrap gap-2">
              {roles.map((role) => (
                <li
                  key={role.id}
                  className="bg-accent text-accent-foreground rounded-sm px-2 py-0.5 text-sm font-medium first-letter:uppercase"
                >
                  {role.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => openUserProfile()}>
          <Icon icon="camera" aria-hidden data-icon="inline-start" />
          {m.profile_change_portrait()}
        </Button>
      </header>

      <DisplayNameForm displayName={user.displayName ?? fullName ?? ''} email={email} />

      <Section
        id="profile-reading-room"
        title={m.profile_reading_room_heading()}
        description={m.profile_reading_room_description()}
      >
        <Field aria-labelledby="profile-language">
          <FieldTitle id="profile-language">{m.language_label()}</FieldTitle>
          <div className="flex flex-wrap gap-2">
            {locales.map((locale) => {
              const isCurrent = locale === currentLocale;

              return (
                <Button
                  key={locale}
                  variant="outline"
                  lang={locale}
                  aria-pressed={isCurrent}
                  className="aria-pressed:border-primary aria-pressed:bg-accent"
                  onClick={() => setLocale(locale)}
                >
                  {isCurrent && <Icon icon="check" aria-hidden data-icon="inline-start" />}
                  {localeName(locale)}
                </Button>
              );
            })}
          </div>
        </Field>
      </Section>

      <Section
        id="profile-roles"
        title={m.profile_roles_heading()}
        description={m.profile_roles_description()}
      >
        {roles.length === 0 ? (
          <p className="text-muted-foreground text-base/6">{m.profile_roles_empty()}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {roles.map((role) => (
              <li
                key={role.id}
                className="bg-card shadow-page border-border flex flex-col gap-3 rounded-md border px-5 py-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="first-letter:uppercase">{role.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {m.profile_role_granted_on({ date: formatDate(role.grantedAt) })}
                  </p>
                </div>
                {role.description && (
                  <p className="text-muted-foreground text-base/6">{role.description}</p>
                )}
                {role.permissions.length > 0 && (
                  <ul
                    aria-label={m.profile_role_permissions({ role: role.name })}
                    className="grid gap-x-6 gap-y-2 text-base/6 sm:grid-cols-2"
                  >
                    {role.permissions.map((permission) => (
                      <li key={permission} className="flex items-center gap-2">
                        <Icon icon="check" aria-hidden className="text-forest size-4.5 shrink-0" />
                        {permissionLabel(permission)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="profile-early-access"
        title={m.profile_early_access_heading()}
        description={m.profile_early_access_description()}
      >
        {featureFlags.length === 0 ? (
          <p className="text-muted-foreground text-base/6">{m.profile_early_access_empty()}</p>
        ) : (
          <ul className="border-border flex flex-col border-t">
            {featureFlags.map((flag) => (
              <li
                key={flag.id}
                className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 border-b py-3.5"
              >
                <Icon icon="bookmark" aria-hidden className="text-gilt size-6 shrink-0" />
                <div className="flex min-w-0 flex-1 basis-64 flex-col">
                  <span className="text-base/6 font-semibold">{flag.description ?? flag.key}</span>
                  {flag.description && (
                    <span className="text-muted-foreground text-sm">{flag.key}</span>
                  )}
                </div>
                {flag.grantedTo === 'user' ? (
                  <span className="bg-secondary text-foreground rounded-sm px-2 py-0.5 text-sm font-medium">
                    {m.profile_flag_granted_to_you()}
                  </span>
                ) : (
                  <span className="border-border text-foreground rounded-sm border px-2 py-0.5 text-sm font-medium">
                    {m.profile_flag_everyone()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="profile-security"
        title={m.profile_security_heading()}
        description={m.profile_security_description()}
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => openUserProfile()}>
            <Icon icon="shield-lock" aria-hidden data-icon="inline-start" />
            {m.profile_security_manage()}
          </Button>
          <Button
            variant="outline"
            onClick={() => void signOut({ redirectUrl: localizeHref('/') })}
          >
            <Icon icon="logout" aria-hidden data-icon="inline-start" />
            {m.user_menu_sign_out()}
          </Button>
        </div>
      </Section>
    </div>
  );
}
