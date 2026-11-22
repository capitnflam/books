import { Button, buttonVariants } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { createFieldMap } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import EditionFields from '#/components/book-form/EditionFields';
import IsbnLookup from '#/components/book-form/IsbnLookup';
import TakenIsbnMessage from '#/components/book-form/TakenIsbnMessage';
import WorkFields from '#/components/book-form/WorkFields';
import ErrorMessage from '#/components/ErrorMessage';
import PageSection from '#/components/PageSection';
import { useAppForm } from '#/hooks/use-app-form';
import { m } from '#/paraglide/messages';
import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';
import {
  CONTRIBUTOR_ROLES,
  applyLookup,
  bookFormErrors,
  emptyBookForm,
  emptyEditionValues,
  emptyWorkValues,
} from '#/services/catalog/catalog';
import { createBookFn } from '#/services/catalog/catalog.functions';
import { checkedOnSubmit } from '#/utils/form-validation';

import type { FoundIsbn } from '#/components/book-form/IsbnLookup';
import type { SaveProblem } from '#/hooks/use-save-book';
import type { BookDraft, BookForm } from '#/services/catalog/catalog';
import type { FC } from 'react';

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
        <Link
          to="/books/$bookId"
          params={{ bookId }}
          className={buttonVariants({ variant: 'outline' })}
        >
          {m.book_view()}
        </Link>
      </div>
    </section>
  );
};

const workFields = createFieldMap(emptyWorkValues());
const editionFields = createFieldMap(emptyEditionValues());

type SavedBook = { bookId: string; title: string };

function NewBookPage() {
  const queryClient = useQueryClient();
  const [problem, setProblem] = useState<SaveProblem | null>(null);
  const [created, setCreated] = useState<SavedBook | null>(null);
  // Remounts the ISBN lookup, clearing its message, when a new book is started.
  const [formKey, setFormKey] = useState(0);
  // What the last lookup filled in, to empty it if another book is looked up.
  const [prefilled, setPrefilled] = useState<BookDraft | null>(null);

  const form = useAppForm({
    defaultValues: emptyBookForm(),
    ...checkedOnSubmit(bookFormErrors),
    onSubmit: async ({ value }) => {
      setProblem(null);

      try {
        const result = await createBookFn({ data: value });

        if (result.error === 'isbn-taken') {
          setProblem(result);

          return;
        }

        setCreated({ bookId: result.bookId, title: result.title });
        queryClient.removeQueries({ queryKey: ['books'] });
      } catch {
        setProblem({ error: 'failed' });
      }
    },
  });

  const startOver = () => {
    form.reset();
    setProblem(null);
    setCreated(null);
    setFormKey((key) => key + 1);
    setPrefilled(null);
  };

  const fillIn = (result: FoundIsbn) => {
    // A book the catalogues don't know still clears what the last lookup filled.
    const draft = result.status === 'found' ? result.draft : {};
    const next = applyLookup(form.state.values, emptyBookForm(), prefilled, draft, result.isbn);

    for (const key of Object.keys(next) as (keyof BookForm)[]) {
      if (next[key] !== form.state.values[key]) {
        form.setFieldValue(key, next[key]);
      }
    }

    setPrefilled(draft);
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
          <form.AppField name="isbn">
            {() => <IsbnLookup key={formKey} onFound={fillIn} />}
          </form.AppField>

          <form
            className="flex flex-col gap-12"
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
            noValidate
          >
            <PageSection
              id="book-work-section"
              title={m.book_work_heading()}
              description={m.book_work_description()}
            >
              <WorkFields
                form={form}
                fields={workFields}
                contributorsHint={m.book_contributors_hint()}
                contributorRoles={CONTRIBUTOR_ROLES}
                series={
                  <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                    <form.AppField name="series">
                      {(field) => (
                        <field.TextField
                          label={m.book_series_label()}
                          error={m.book_text_error()}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="seriesPosition">
                      {(field) => (
                        <field.TextField
                          inputMode="decimal"
                          label={m.book_series_position_label()}
                          error={m.book_series_position_error()}
                        />
                      )}
                    </form.AppField>
                  </div>
                }
              />
            </PageSection>

            <PageSection
              id="book-edition-section"
              title={m.book_edition_heading()}
              description={m.book_edition_description()}
            >
              <form.Subscribe selector={({ values }) => values.title}>
                {(title) => <EditionFields form={form} fields={editionFields} title={title} />}
              </form.Subscribe>
            </PageSection>

            <div className="flex flex-wrap-reverse items-center justify-end gap-4">
              <form.AppForm>
                <form.FormStatus>
                  {problem?.error === 'isbn-taken' && (
                    <TakenIsbnMessage bookId={problem.bookId} title={problem.title} />
                  )}
                  {problem?.error === 'failed' && (
                    <ErrorMessage>{m.book_create_failed()}</ErrorMessage>
                  )}
                </form.FormStatus>
                <form.SubmitButton>
                  <Icon icon="book-upload" aria-hidden data-icon="inline-start" />
                  {m.book_create()}
                </form.SubmitButton>
              </form.AppForm>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
