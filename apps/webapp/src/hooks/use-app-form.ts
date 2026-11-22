import { createFormHook } from '@tanstack/react-form';

import { fieldContext, formContext } from '#/components/form/form-context';
import FormStatus from '#/components/form/FormStatus';
import SubmitButton from '#/components/form/SubmitButton';
import TextareaField from '#/components/form/TextareaField';
import TextField from '#/components/form/TextField';

/** TanStack Form with the app's own fields, as `form.AppField` and `form.AppForm` offer them. */
export const { useAppForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField },
  formComponents: { FormStatus, SubmitButton },
});
