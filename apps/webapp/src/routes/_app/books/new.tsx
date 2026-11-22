import { Button } from '@books/ui/components/button';
import { Field, FieldDescription, FieldLabel } from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { useQueryClient } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import EditionFields from '#/components/book-form/EditionFields';
import FormField from '#/components/book-form/FormField';
import TakenIsbnMessage from '#/components/book-form/TakenIsbnMessage';
import WorkFields from '#/components/book-form/WorkFields';
import ErrorMessage from '#/components/ErrorMessage';
import PageSection from '#/components/PageSection';
import TextLink from '#/components/TextLink';
import { m } from '#/paraglide/messages';
import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';
import { applyLookup, bookFormErrors, emptyBookForm } from '#/services/catalog/catalog';
import { createBookFn, lookupIsbnFn } from '#/services/catalog/catalog.functions';

import type { BookDraft, BookForm } from '#/services/catalog/catalog';
import type { FC, FormEvent } from 'react';

export const Route = createFileRoute('/_app/books/new')({
  beforeLoad: async ({ location }) => {
    // The server functions the page calls check the permission again on their own.
    await checkPermissionFn({
      data: { permission: 'catalog:manage', redirect_url: localizeHref(location.href) },
    });
  },
  head: () => ({ meta: [{ title: m.book_new_title() }] }),
  component: NewBookPage,
});

type LookupResult = Awaited<ReturnType<typeof lookupIsbnFn>>;
type LookupState = { status: 'idle' | 'loading' | 'failed' } | LookupResult;

const lookupMessages = (lookup: LookupState): { text: string; error: boolean } | null => {
  switch (lookup.status) {
    case 'loading':
      return { text: m.book_isbn_looking_up(), error: false };
    case 'found':
      return { text: m.book_isbn_found(), error: false };
    case 'not-found':
      return { text: m.book_isbn_not_found(), error: false };
    case 'exists':
      return { text: m.book_isbn_exists({ title: lookup.title }), error: true };
    case 'invalid':
      return { text: m.book_isbn_invalid(), error: true };
    case 'unavailable':
      return { text: m.book_isbn_unavailable(), error: true };
    case 'failed':
      return { text: m.book_isbn_failed(), error: true };
    default:
      return null;
  }
};

const IsbnLookup: FC<{
  isbn: string;
  invalid: boolean;
  onIsbnChange: (isbn: string) => void;
  onFound: (result: Extract<LookupResult, { isbn: string }>) => void;
}> = ({ isbn, invalid, onIsbnChange, onFound }) => {
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' });
  // Counts lookups and ISBN edits: a response is applied only if nothing happened since its
  // request, so a slow answer for an ISBN that was then corrected can't overwrite the new one.
  const latestRequest = useRef(0);
  const message = lookupMessages(lookup);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    latestRequest.current += 1;
    const request = latestRequest.current;

    if (!isbn.trim()) {
      setLookup({ status: 'invalid' });

      return;
    }

    setLookup({ status: 'loading' });

    try {
      const result = await lookupIsbnFn({ data: { isbn } });

      if (request !== latestRequest.current) {
        return;
      }

      setLookup(result);

      if ('isbn' in result) {
        onFound(result);
      }
    } catch {
      if (request === latestRequest.current) {
        setLookup({ status: 'failed' });
      }
    }
  };

  const showError = invalid || lookup.status === 'invalid';

  return (
    <PageSection id="book-isbn-section" title={m.book_isbn_heading()}>
      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        <Field data-invalid={showError ? true : undefined}>
          <FieldLabel htmlFor="book-isbn">{m.book_isbn_label()}</FieldLabel>
          <div className="flex flex-wrap gap-2">
            <Input
              id="book-isbn"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              className="max-w-xs flex-1"
              aria-invalid={showError ? true : undefined}
              aria-describedby="book-isbn-hint book-isbn-status"
              value={isbn}
              onChange={(event) => {
                latestRequest.current += 1;
                onIsbnChange(event.target.value);
                setLookup({ status: 'idle' });
              }}
            />
            <Button type="submit" variant="secondary" disabled={lookup.status === 'loading'}>
              <Icon icon="barcode" aria-hidden data-icon="inline-start" />
              {m.book_isbn_lookup()}
            </Button>
          </div>
          <FieldDescription id="book-isbn-hint">{m.book_isbn_hint()}</FieldDescription>
          <FieldDescription>{m.book_isbn_sources()}</FieldDescription>
        </Field>
        <div id="book-isbn-status" role="status" className="mt-3 empty:hidden">
          {message
            && (message.error ? (
              <p className="text-destructive flex items-center gap-2 text-base/6">
                <Icon icon="alert-circle" aria-hidden className="size-5 shrink-0" />
                <span>
                  {message.text}
                  {lookup.status === 'exists' && (
                    <>
                      {' '}
                      <TextLink
                        to="/books/$bookId"
                        params={{ bookId: lookup.bookId }}
                        className="underline"
                      >
                        {m.book_view()}
                      </TextLink>
                    </>
                  )}
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground flex items-center gap-2 text-base/6">
                {lookup.status === 'found' && (
                  <Icon icon="circle-check" aria-hidden className="text-forest size-5 shrink-0" />
                )}
                {message.text}
              </p>
            ))}
        </div>
      </form>
    </PageSection>
  );
};

const Created: FC<{ bookId: string; title: string; onAddAnother: () => void }> = ({
  bookId,
  title,
  onAddAnother,
}) => {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => heading.current?.focus(), []);

  return (
    <section className="border-rule bg-card shadow-page flex flex-col items-start gap-4 rounded-lg border p-6">
      <h2
        ref={heading}
        tabIndex={-1}
        className="text-heading-3 flex items-center gap-3 outline-none"
      >
        <Icon icon="circle-check" aria-hidden className="text-forest size-6 shrink-0" />
        {m.book_created({ title })}
      </h2>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onAddAnother}>
          <Icon icon="plus" aria-hidden data-icon="inline-start" />
          {m.book_add_another()}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to="/books/$bookId" params={{ bookId }} />}
        >
          {m.book_view()}
        </Button>
      </div>
    </section>
  );
};

type SavedBook = { bookId: string; title: string };

function NewBookPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BookForm>(emptyBookForm);
  // Fields are checked once the form has been sent, then again as they change.
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'failed'>('idle');
  const [taken, setTaken] = useState<SavedBook | null>(null);
  const [created, setCreated] = useState<SavedBook | null>(null);
  // Remounts the ISBN lookup, clearing its message, when a new book is started.
  const [formKey, setFormKey] = useState(0);
  // What the last lookup filled in, to empty it if another book is looked up.
  const [prefilled, setPrefilled] = useState<BookDraft | null>(null);

  const errors = submitted ? bookFormErrors(form) : new Set<string>();
  const update = (change: Partial<BookForm>) => setForm((current) => ({ ...current, ...change }));
  const error = (key: string, message: string) => errors.has(key) && message;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setTaken(null);

    if (bookFormErrors(form).size > 0) {
      return;
    }

    setStatus('saving');

    try {
      const result = await createBookFn({ data: form });

      if (result.error === 'isbn-taken') {
        setTaken({ bookId: result.bookId, title: result.title });
        setStatus('idle');

        return;
      }

      setCreated({ bookId: result.bookId, title: result.title });
      queryClient.removeQueries({ queryKey: ['books'] });
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  };

  const startOver = () => {
    setForm(emptyBookForm());
    setSubmitted(false);
    setTaken(null);
    setCreated(null);
    setFormKey((key) => key + 1);
    setPrefilled(null);
  };

  return (
    <div className="container mx-auto flex max-w-3xl flex-col gap-12 px-4 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-overline text-muted-foreground uppercase">{m.book_new_overline()}</p>
        <h1>{m.book_new_title()}</h1>
        <span aria-hidden className="bg-gilt h-0.5 w-16" />
        <p className="text-muted-foreground mt-1">{m.book_new_intro()}</p>
      </header>

      {created ? (
        <Created {...created} onAddAnother={startOver} />
      ) : (
        <>
          <IsbnLookup
            key={formKey}
            isbn={form.isbn}
            invalid={errors.has('isbn')}
            onIsbnChange={(isbn) => update({ isbn })}
            onFound={(result) => {
              // A book the catalogues don't know still clears what the last lookup filled.
              const draft = result.status === 'found' ? result.draft : {};

              setForm((current) => applyLookup(current, prefilled, draft, result.isbn));
              setPrefilled(draft);
            }}
          />

          <form
            className="flex flex-col gap-12"
            onSubmit={(event) => void handleSubmit(event)}
            noValidate
          >
            <PageSection
              id="book-work-section"
              title={m.book_work_heading()}
              description={m.book_work_description()}
            >
              <WorkFields
                form={form}
                errors={errors}
                contributorsHint={m.book_contributors_hint()}
                series={
                  <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                    <FormField
                      name="series"
                      label={m.book_series_label()}
                      error={error('series', m.book_text_error())}
                    >
                      {(props) => (
                        <Input
                          autoComplete="off"
                          value={form.series}
                          onChange={(event) => update({ series: event.target.value })}
                          {...props}
                        />
                      )}
                    </FormField>
                    <FormField
                      name="series-position"
                      label={m.book_series_position_label()}
                      error={error('seriesPosition', m.book_series_position_error())}
                    >
                      {(props) => (
                        <Input
                          inputMode="decimal"
                          autoComplete="off"
                          value={form.seriesPosition}
                          onChange={(event) => update({ seriesPosition: event.target.value })}
                          {...props}
                        />
                      )}
                    </FormField>
                  </div>
                }
                onChange={update}
              />
            </PageSection>

            <PageSection
              id="book-edition-section"
              title={m.book_edition_heading()}
              description={m.book_edition_description()}
            >
              <EditionFields form={form} errors={errors} title={form.title} onChange={update} />
            </PageSection>

            <div className="flex flex-wrap-reverse items-center justify-end gap-4">
              {errors.size > 0 && <ErrorMessage>{m.book_form_invalid()}</ErrorMessage>}
              {taken && <TakenIsbnMessage {...taken} />}
              {status === 'failed' && <ErrorMessage>{m.book_create_failed()}</ErrorMessage>}
              <Button type="submit" disabled={status === 'saving'}>
                <Icon icon="book-upload" aria-hidden data-icon="inline-start" />
                {m.book_create()}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
