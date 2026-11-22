import { revalidateLogic } from '@tanstack/react-form';

import type { z } from 'zod';

/** The fields of a form without lists or nested values that `schema` refuses. */
export const refusedFields =
  (schema: z.ZodType) =>
  (values: unknown): ReadonlySet<string> => {
    const result = schema.safeParse(values);

    return new Set(result.success ? [] : result.error.issues.map(({ path }) => String(path[0])));
  };

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
