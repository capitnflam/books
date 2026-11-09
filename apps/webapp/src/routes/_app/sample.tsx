import { Button } from '@books/ui/components/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { IconButton } from '@books/ui/components/icon-button';
import { Input } from '@books/ui/components/input';
import { Separator } from '@books/ui/components/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@books/ui/components/tooltip';
import { useClipboard } from '@books/ui/hooks/use-clipboard';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import LocaleSwitcher from '#/components/LocaleSwitcher';
import { m } from '#/paraglide/messages';

import type { IconName } from '@books/ui/components/icon';
import type { FC, FormEvent, ReactNode } from 'react';

export const Route = createFileRoute('/_app/sample')({
  component: SamplePage,
  head: () => ({ meta: [{ title: m.sample_page_title() }] }),
});

const Section: FC<{ title: string; description?: string; children: ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2>{title}</h2>
      {description && <p className="text-muted-foreground text-ui">{description}</p>}
    </div>
    {children}
  </section>
);

type IconWithTooltipProps = {
  icon: IconName;
  label: string;
  variant?: 'outline' | 'ghost' | 'destructive';
  onClick?: () => void;
};

const IconWithTooltip: FC<IconWithTooltipProps> = ({
  icon,
  label,
  variant = 'outline',
  onClick,
}) => (
  <Tooltip>
    <TooltipTrigger
      render={<IconButton icon={icon} label={label} variant={variant} onClick={onClick} />}
    />
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

const countDigits = (isbn: string) => isbn.replaceAll(/[\s-]/gu, '').length;

const BookForm: FC = () => {
  const { copy } = useClipboard();
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [isbnError, setIsbnError] = useState<string>();
  const [copyStatus, setCopyStatus] = useState<string>();
  const [saved, setSaved] = useState<string>();

  const handleCopy = async () => {
    try {
      await copy(isbn);
      setCopyStatus(m.sample_form_isbn_copied());
    } catch {
      setCopyStatus(m.sample_form_isbn_copy_failed());
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = countDigits(isbn);

    if (isbn && digits !== 10 && digits !== 13) {
      setIsbnError(m.sample_form_isbn_error({ count: digits }));
      setSaved(undefined);

      return;
    }

    setIsbnError(undefined);
    setSaved(m.sample_form_saved({ title: title.trim() || m.sample_form_untitled() }));
  };

  return (
    <form className="flex max-w-xl flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <FieldSet>
        <FieldLegend>{m.sample_form_legend()}</FieldLegend>
        <FieldDescription>{m.sample_form_description()}</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="sample-title">{m.sample_form_title_label()}</FieldLabel>
            <Input
              id="sample-title"
              placeholder={m.sample_form_title_placeholder()}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sample-author">{m.sample_form_author_label()}</FieldLabel>
            <Input id="sample-author" placeholder={m.sample_form_author_placeholder()} />
          </Field>
          <FieldSeparator>{m.sample_form_or()}</FieldSeparator>
          <Field data-invalid={isbnError ? true : undefined}>
            <FieldLabel htmlFor="sample-isbn">{m.sample_form_isbn_label()}</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="sample-isbn"
                inputMode="numeric"
                placeholder={m.sample_form_isbn_placeholder()}
                aria-invalid={isbnError ? true : undefined}
                aria-describedby="sample-isbn-hint"
                value={isbn}
                onChange={(event) => setIsbn(event.target.value)}
              />
              <IconWithTooltip
                icon="copy"
                label={m.sample_form_isbn_copy()}
                onClick={() => void handleCopy()}
              />
            </div>
            <FieldDescription id="sample-isbn-hint">
              {copyStatus ?? m.sample_form_isbn_hint()}
            </FieldDescription>
            <FieldError>{isbnError}</FieldError>
          </Field>
          <Field data-disabled>
            <FieldLabel htmlFor="sample-shelf">{m.sample_form_shelf_label()}</FieldLabel>
            <Input id="sample-shelf" disabled defaultValue="823.912 TOL" />
            <FieldDescription>{m.sample_form_shelf_hint()}</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
      <div className="flex items-center justify-end gap-3">
        <Button type="reset" variant="ghost" onClick={() => setSaved(undefined)}>
          {m.sample_button_cancel()}
        </Button>
        <Button type="submit">
          <Icon icon="device-floppy" aria-hidden data-icon="inline-start" />
          {m.sample_form_submit()}
        </Button>
      </div>
      <p role="status" className="text-forest text-ui flex items-center gap-2 empty:hidden">
        {saved && (
          <>
            <Icon icon="circle-check" aria-hidden className="size-5" />
            {saved}
          </>
        )}
      </p>
    </form>
  );
};

function SamplePage() {
  return (
    <TooltipProvider>
      <div className="container mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-overline text-muted-foreground uppercase">{m.sample_overline()}</p>
            <h1>{m.sample_heading()}</h1>
            <p className="text-muted-foreground">{m.sample_intro()}</p>
          </div>
          <LocaleSwitcher />
        </header>

        <Separator />

        <Section title={m.sample_buttons_heading()} description={m.sample_buttons_description()}>
          <div className="flex flex-wrap items-center gap-3">
            <Button>{m.sample_button_borrow()}</Button>
            <Button variant="secondary">{m.sample_button_reserve()}</Button>
            <Button variant="outline">{m.sample_button_view()}</Button>
            <Button variant="ghost">{m.sample_button_cancel()}</Button>
            <Button variant="destructive">
              <Icon icon="trash" aria-hidden data-icon="inline-start" />
              {m.sample_button_delete()}
            </Button>
            <Button variant="link">{m.sample_button_learn_more()}</Button>
            <Button disabled>{m.sample_button_unavailable()}</Button>
          </div>
          <h3>{m.sample_sizes_heading()}</h3>
          <div className="flex flex-wrap items-center gap-3">
            {(['lg', 'default', 'sm', 'xs'] as const).map((size) => (
              <Button key={size} size={size} variant="outline">
                {m.sample_button_reserve()} · {size}
              </Button>
            ))}
          </div>
        </Section>

        <Separator />

        <Section title={m.sample_icon_buttons_heading()}>
          <div className="flex flex-wrap items-center gap-3">
            <IconWithTooltip icon="bookmark" label={m.sample_icon_bookmark()} />
            <IconWithTooltip icon="pencil" label={m.sample_icon_edit()} />
            <IconWithTooltip icon="share" label={m.sample_icon_share()} variant="ghost" />
            <IconWithTooltip icon="trash" label={m.sample_icon_delete()} variant="destructive" />
          </div>
        </Section>

        <Separator />

        <BookForm />
      </div>
    </TooltipProvider>
  );
}
