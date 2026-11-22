import { revalidateLogic } from '@tanstack/react-form';

/**
 * Options for a form whose `errorsOf` names the fields the server would refuse. They are
 * checked once the form has been sent, then again as they change. A field is only marked as
 * wrong: it writes its own message, in the page's language.
 */
export const checkedOnSubmit = <Values>(errorsOf: (values: Values) => ReadonlySet<string>) => ({
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: ({ value }: { value: Values }) => {
      const errors = errorsOf(value);

      return errors.size > 0
        ? { fields: Object.fromEntries([...errors].map((name) => [name, 'invalid'])) }
        : undefined;
    },
  },
});
