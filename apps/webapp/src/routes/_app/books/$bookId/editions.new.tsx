import { createFieldMap } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import BackLink from '#/components/BackLink';
import EditionFormFields from '#/components/book-form/EditionFormFields';
import FormActions from '#/components/book-form/FormActions';
import IsbnLookup from '#/components/book-form/IsbnLookup';
import BookNotFound from '#/components/BookNotFound';
import PageSection from '#/components/PageSection';
import { useAppForm } from '#/hooks/use-app-form';
import { useSaveBook } from '#/hooks/use-save-book';
import { m } from '#/paraglide/messages';
import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';
import { loadBookDetails } from '#/services/catalog/book-details';
import {
  applyLookup,
  editionDraftOf,
  editionFormErrors,
  emptyEditionForm,
} from '#/services/catalog/catalog';
import { createEditionFn } from '#/services/catalog/catalog.functions';
import { checkedOnSubmit } from '#/utils/form-validation';

import type { FoundIsbn } from '#/components/book-form/IsbnLookup';
import type { EditionDraft, EditionForm } from '#/services/catalog/catalog';

export const Route = createFileRoute('/_app/books/$bookId/editions/new')({
  beforeLoad: async ({ location }) => {
    // The server functions the page calls check the permission again on their own.
    await checkPermissionFn({
      data: { permission: 'catalog:manage', redirect_url: localizeHref(location.href) },
    });
  },
  loader: async ({ params }) => loadBookDetails(params),
  head: () => ({ meta: [{ title: m.book_edition_new_title() }] }),
  notFoundComponent: BookNotFound,
  component: NewEditionPage,
});

const editionFields = createFieldMap(emptyEditionForm());

function NewEditionPage() {
  const { book } = Route.useLoaderData();
  const { problem, save } = useSaveBook(book.id);
  // What the last lookup filled in, to empty it if another ISBN is looked up.
  const [prefilled, setPrefilled] = useState<EditionDraft | null>(null);
  const form = useAppForm({
    defaultValues: emptyEditionForm(),
    ...checkedOnSubmit(editionFormErrors),
    onSubmit: async ({ value }) =>
      save(async () => createEditionFn({ data: { bookId: book.id, ...value } })),
  });

  const fillIn = (result: FoundIsbn) => {
    // An ISBN the catalogues don't know still clears what the last lookup filled.
    const draft = result.status === 'found' ? editionDraftOf(result.draft, book) : {};
    const next = applyLookup(form.state.values, emptyEditionForm(), prefilled, draft, result.isbn);

    for (const key of Object.keys(next) as (keyof EditionForm)[]) {
      if (next[key] !== form.state.values[key]) {
        form.setFieldValue(key, next[key]);
      }
    }

    setPrefilled(draft);
  };

  return (
    <div className="container mx-auto flex max-w-3xl flex-col gap-12 px-4 py-16">
      <div className="flex flex-col gap-6">
        <BackLink to="/books/$bookId" params={{ bookId: book.id }}>
          {m.book_back_to({ title: book.title })}
        </BackLink>
        <header className="flex flex-col gap-2">
          <p className="text-overline text-muted-foreground uppercase">{book.title}</p>
          <h1>{m.book_edition_new_title()}</h1>
          <span aria-hidden className="bg-gilt h-0.5 w-16" />
          <p className="text-muted-foreground mt-1">{m.book_edition_new_intro()}</p>
        </header>
      </div>

      <form.AppField name="isbn">{() => <IsbnLookup onFound={fillIn} />}</form.AppField>

      <form
        className="flex flex-col gap-12"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        noValidate
      >
        <PageSection
          id="book-edition-section"
          title={m.book_edition_heading()}
          description={m.book_edition_description()}
        >
          <EditionFormFields form={form} fields={editionFields} bookTitle={book.title} />
        </PageSection>
        <form.AppForm>
          <FormActions bookId={book.id} problem={problem} adding />
        </form.AppForm>
      </form>
    </div>
  );
}
