import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import { useAppForm } from '#/hooks/use-app-form';
import { m } from '#/paraglide/messages';
import { DISPLAY_NAME_MAX_LENGTH, displayNameSchema } from '#/services/profile/profile';
import { checkedOnSubmit, refusedFields } from '#/utils/form-validation';

import type { FC, ReactNode } from 'react';

type DisplayNameFormProps = {
  displayName: string;
  legend: string;
  description: string;
  hint?: string;
  autoComplete?: string;
  savedMessage: string;
  failedMessage: string;
  onSave: (displayName: string) => Promise<unknown>;
  /** Shown after the name's field. */
  children?: ReactNode;
};

/** Changes the name a user goes by: the user's own, or another's. */
const DisplayNameForm: FC<DisplayNameFormProps> = ({
  displayName,
  legend,
  description,
  hint,
  autoComplete = 'off',
  savedMessage,
  failedMessage,
  onSave,
  children,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saved' | 'failed'>('idle');
  const form = useAppForm({
    defaultValues: { displayName },
    ...checkedOnSubmit(refusedFields(displayNameSchema)),
    listeners: { onChange: () => setStatus('idle') },
    onSubmit: async ({ value, formApi }) => {
      const saved = displayNameSchema.parse(value);

      setStatus('idle');

      try {
        await onSave(saved.displayName);
        formApi.setFieldValue('displayName', saved.displayName);
        setStatus('saved');
        // Reload the loaders, so everything that shows the name uses the new one.
        await router.invalidate();
      } catch {
        setStatus('failed');
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      noValidate
    >
      <FieldSet>
        <FieldLegend>{legend}</FieldLegend>
        <FieldDescription>{description}</FieldDescription>
        <FieldGroup>
          <form.AppField name="displayName">
            {(field) => (
              <field.TextField
                autoComplete={autoComplete}
                className="max-w-sm"
                label={m.profile_display_name_label()}
                hint={hint}
                error={
                  field.state.value.trim()
                    ? m.profile_display_name_too_long({ max: DISPLAY_NAME_MAX_LENGTH })
                    : m.profile_display_name_required()
                }
              />
            )}
          </form.AppField>
          {children}
        </FieldGroup>
      </FieldSet>
      <div className="flex flex-wrap-reverse items-center justify-end gap-4">
        <p role="status" className="text-forest text-ui flex items-center gap-2 empty:hidden">
          {status === 'saved' && (
            <>
              <Icon icon="circle-check" aria-hidden className="size-5" />
              {savedMessage}
            </>
          )}
        </p>
        {status === 'failed' && <FieldError>{failedMessage}</FieldError>}
        <form.AppForm>
          <form.SubmitButton>
            <Icon icon="device-floppy" aria-hidden data-icon="inline-start" />
            {m.profile_save()}
          </form.SubmitButton>
        </form.AppForm>
      </div>
    </form>
  );
};

export default DisplayNameForm;
