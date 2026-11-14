import { Button } from '@books/ui/components/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import ErrorMessage from '#/components/ErrorMessage';
import PageSection from '#/components/PageSection';
import { m } from '#/paraglide/messages';
import {
  FLAG_DESCRIPTION_MAX_LENGTH,
  FLAG_KEY_MAX_LENGTH,
  flagKeyError,
} from '#/services/feature-flags/feature-flags';
import {
  createFeatureFlagFn,
  listFeatureFlagsFn,
} from '#/services/feature-flags/feature-flags.functions';
import { formatDate } from '#/utils/dates';

import type { FC, FormEvent } from 'react';

export const Route = createFileRoute('/_app/feature-flags/')({
  loader: async () => listFeatureFlagsFn(),
  head: () => ({ meta: [{ title: m.flags_title() }] }),
  component: FeatureFlagsPage,
});

type ListedFlag = Awaited<ReturnType<typeof listFeatureFlagsFn>>[number];

const keyErrorMessages = {
  required: () => m.flags_key_required(),
  'too-long': () => m.flags_key_too_long({ max: FLAG_KEY_MAX_LENGTH }),
  format: () => m.flags_key_format(),
  'key-taken': () => m.flags_key_taken(),
};

const NewFlagForm: FC = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [keyError, setKeyError] = useState<keyof typeof keyErrorMessages | null>(null);
  const [descriptionTooLong, setDescriptionTooLong] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'failed'>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalidKey = flagKeyError(key);
    const longDescription = description.trim().length > FLAG_DESCRIPTION_MAX_LENGTH;

    setKeyError(invalidKey);
    setDescriptionTooLong(longDescription);

    if (invalidKey || longDescription) {
      return;
    }

    setStatus('saving');

    try {
      const { id, error } = await createFeatureFlagFn({
        data: { key: key.trim(), description },
      });

      if (error) {
        setKeyError(error);
        setStatus('idle');

        return;
      }

      await navigate({ to: '/feature-flags/$flagId', params: { flagId: id } });
    } catch {
      setStatus('failed');
    }
  };

  return (
    <PageSection
      id="flags-new"
      title={m.flags_new_heading()}
      description={m.flags_new_description()}
    >
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <FieldGroup>
          <Field data-invalid={keyError ? true : undefined}>
            <FieldLabel htmlFor="flag-key">{m.flags_key_label()}</FieldLabel>
            <Input
              id="flag-key"
              autoComplete="off"
              spellCheck={false}
              className="max-w-sm"
              aria-invalid={keyError ? true : undefined}
              aria-describedby="flag-key-hint"
              value={key}
              onChange={(event) => setKey(event.target.value)}
            />
            <FieldDescription id="flag-key-hint">{m.flags_key_hint()}</FieldDescription>
            <FieldError>{keyError && keyErrorMessages[keyError]()}</FieldError>
          </Field>
          <Field data-invalid={descriptionTooLong ? true : undefined}>
            <FieldLabel htmlFor="flag-description">{m.flags_description_label()}</FieldLabel>
            <Input
              id="flag-description"
              autoComplete="off"
              aria-invalid={descriptionTooLong ? true : undefined}
              aria-describedby="flag-description-hint"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <FieldDescription id="flag-description-hint">
              {m.flags_description_hint()}
            </FieldDescription>
            <FieldError>
              {descriptionTooLong
                && m.flags_description_too_long({ max: FLAG_DESCRIPTION_MAX_LENGTH })}
            </FieldError>
          </Field>
        </FieldGroup>
        <div className="flex flex-wrap-reverse items-center justify-end gap-4">
          {status === 'failed' && <ErrorMessage>{m.flags_create_failed()}</ErrorMessage>}
          <Button type="submit" disabled={status === 'saving'}>
            <Icon icon="plus" aria-hidden data-icon="inline-start" />
            {m.flags_create()}
          </Button>
        </div>
      </form>
    </PageSection>
  );
};

const FlagRow: FC<{ flag: ListedFlag }> = ({ flag }) => (
  <tr className="border-border border-b">
    <td className="py-3 pr-4">
      <div className="flex min-w-0 flex-col">
        <Link
          to="/feature-flags/$flagId"
          params={{ flagId: flag.id }}
          className="text-link focus-visible:ring-ring focus-visible:ring-offset-background self-start rounded-sm font-semibold break-all underline-offset-3 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {flag.key}
        </Link>
        {flag.description && (
          <span className="text-muted-foreground text-sm">{flag.description}</span>
        )}
      </div>
    </td>
    <td className="py-3 pr-4">{flag.userCount}</td>
    <td className="text-muted-foreground py-3 text-sm whitespace-nowrap">
      {formatDate(flag.createdAt)}
    </td>
  </tr>
);

function FeatureFlagsPage() {
  const flags = Route.useLoaderData();

  return (
    <div className="container mx-auto flex max-w-5xl flex-col gap-12 px-4 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-overline text-muted-foreground uppercase">{m.nav_group_admin()}</p>
        <h1>{m.flags_title()}</h1>
        <span aria-hidden className="bg-gilt h-0.5 w-16" />
        <p className="text-muted-foreground mt-1">{m.flags_intro()}</p>
      </header>

      <PageSection id="flags-list" title={m.flags_list_heading({ count: flags.length })}>
        {flags.length === 0 ? (
          <p className="text-muted-foreground text-base/6">{m.flags_empty()}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-xl text-left text-base/6">
              <thead className="border-rule border-b">
                <tr>
                  <th scope="col" className="text-muted-foreground py-2 pr-4 text-sm font-semibold">
                    {m.flags_column_flag()}
                  </th>
                  <th scope="col" className="text-muted-foreground py-2 pr-4 text-sm font-semibold">
                    {m.flags_column_users()}
                  </th>
                  <th scope="col" className="text-muted-foreground py-2 text-sm font-semibold">
                    {m.flags_column_created()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {flags.map((flag) => (
                  <FlagRow key={flag.id} flag={flag} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageSection>

      <NewFlagForm />
    </div>
  );
}
