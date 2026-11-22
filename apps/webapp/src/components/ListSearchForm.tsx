import { Button } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { Label } from '@books/ui/components/label';
import { useEffect } from 'react';

import { useAppForm } from '#/hooks/use-app-form';

import type { FC } from 'react';

type ListSearchFormProps = {
  id: string;
  label: string;
  submitLabel: string;
  /** The search param the text goes in when the form is sent before the page has loaded. */
  name?: string;
  /** The text the list is searched for now. */
  query: string | undefined;
  onSearch: (query: string | undefined) => void;
};

/** The search box above a list. */
const ListSearchForm: FC<ListSearchFormProps> = ({
  id,
  name = 'q',
  label,
  submitLabel,
  query,
  onSearch,
}) => {
  const form = useAppForm({
    defaultValues: { q: query ?? '' },
    onSubmit: ({ value }) => onSearch(value.q.trim() || undefined),
  });

  // Going back in history shows the matching text.
  useEffect(() => form.reset({ q: query ?? '' }), [form, query]);

  return (
    <search>
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <Label htmlFor={id}>{label}</Label>
        <div className="flex max-w-lg gap-2">
          <form.AppField name="q">
            {(field) => (
              <Input
                id={id}
                name={name}
                type="search"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.AppField>
          <Button type="submit" variant="outline">
            <Icon icon="search" aria-hidden data-icon="inline-start" />
            {submitLabel}
          </Button>
        </div>
      </form>
    </search>
  );
};

export default ListSearchForm;
