import { FieldGroup } from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import ErrorMessage from '#/components/ErrorMessage';
import PageSection from '#/components/PageSection';
import { useAppForm } from '#/hooks/use-app-form';
import { m } from '#/paraglide/messages';
import {
  FLAG_DESCRIPTION_MAX_LENGTH,
  FLAG_KEY_MAX_LENGTH,
  createFeatureFlagSchema,
  flagKeyError,
} from '#/services/feature-flags/feature-flags';
import {
  createFeatureFlagFn,
  listFeatureFlagsFn,
} from '#/services/feature-flags/feature-flags.functions';
import { formatDate } from '#/utils/dates';
import { checkedOnSubmit, refusedFields } from '#/utils/form-validation';

import type { FC } from 'react';

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

/** Why the key is refused: what is wrong with it, or else what the server answered. */
const keyErrorMessage = (key: string) => keyErrorMessages[flagKeyError(key) ?? 'key-taken']();

const NewFlagForm: FC = () => {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const form = useAppForm({
    defaultValues: { key: '', description: '' },
    ...checkedOnSubmit(refusedFields(createFeatureFlagSchema)),
    onSubmit: async ({ value, formApi }) => {
      setFailed(false);

      try {
        const { id, error } = await createFeatureFlagFn({ data: value });

        if (error) {
          formApi.setFieldMeta('key', (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, onSubmit: error },
          }));

          return;
        }

        await navigate({ to: '/feature-flags/$flagId', params: { flagId: id } });
      } catch {
        setFailed(true);
      }
    },
  });

  return (
    <PageSection
      id="flags-new"
      title={m.flags_new_heading()}
      description={m.flags_new_description()}
    >
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          // A key the server refused is sent again: it may be free by now.
          form.setFieldMeta('key', (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, onSubmit: undefined },
          }));
          void form.handleSubmit();
        }}
        noValidate
      >
        <FieldGroup>
          <form.AppField name="key">
            {(field) => (
              <field.TextField
                spellCheck={false}
                className="max-w-sm"
                label={m.flags_key_label()}
                hint={m.flags_key_hint()}
                error={keyErrorMessage(field.state.value)}
              />
            )}
          </form.AppField>
          <form.AppField name="description">
            {(field) => (
              <field.TextField
                label={m.flags_description_label()}
                hint={m.flags_description_hint()}
                error={m.flags_description_too_long({ max: FLAG_DESCRIPTION_MAX_LENGTH })}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <div className="flex flex-wrap-reverse items-center justify-end gap-4">
          {failed && <ErrorMessage>{m.flags_create_failed()}</ErrorMessage>}
          <form.AppForm>
            <form.SubmitButton>
              <Icon icon="plus" aria-hidden data-icon="inline-start" />
              {m.flags_create()}
            </form.SubmitButton>
          </form.AppForm>
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
