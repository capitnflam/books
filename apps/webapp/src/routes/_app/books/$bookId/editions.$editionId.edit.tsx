import { FieldGroup } from '@books/ui/components/field';
import { createFieldMap } from '@tanstack/react-form';
import { createFileRoute, notFound } from '@tanstack/react-router';

import BackLink from '#/components/BackLink';
import EditionFormFields from '#/components/book-form/EditionFormFields';
import FormActions from '#/components/book-form/FormActions';
import BookNotFound from '#/components/BookNotFound';
import DeleteSection from '#/components/DeleteSection';
import { useAppForm } from '#/hooks/use-app-form';
import { useDeleteFromCatalog } from '#/hooks/use-delete-from-catalog';
import { useSaveBook } from '#/hooks/use-save-book';
import { m } from '#/paraglide/messages';
import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';
import { loadBookDetails } from '#/services/catalog/book-details';
import { editionFormErrors, editionFormOf, emptyEditionForm } from '#/services/catalog/catalog';
import { deleteEditionFn, updateEditionFn } from '#/services/catalog/catalog.functions';
import { checkedOnSubmit } from '#/utils/form-validation';

export const Route = createFileRoute('/_app/books/$bookId/editions/$editionId/edit')({
  beforeLoad: async ({ location }) => {
    // The server functions the page calls check the permission again on their own.
    await checkPermissionFn({
      data: { permission: 'catalog:manage', redirect_url: localizeHref(location.href) },
    });
  },
  loader: async ({ params }) => {
    const { book } = await loadBookDetails(params);
    const edition = book.editions.find(({ id }) => id === params.editionId);

    if (!edition) {
      throw notFound();
    }

    return { book, edition };
  },
  // The form is filled in once, from this: never from what an earlier visit loaded.
  gcTime: 0,
  preloadGcTime: 0,
  head: () => ({ meta: [{ title: m.book_edition_edit_title() }] }),
  notFoundComponent: BookNotFound,
  component: EditEditionPage,
});

const editionFields = createFieldMap(emptyEditionForm());

function EditEditionPage() {
  const { book, edition } = Route.useLoaderData();
  const { problem, save } = useSaveBook(book.id);
  const deletion = useDeleteFromCatalog({ to: '/books/$bookId', params: { bookId: book.id } });
  const form = useAppForm({
    defaultValues: editionFormOf(edition),
    ...checkedOnSubmit(editionFormErrors),
    onSubmit: async ({ value }) =>
      save(async () => updateEditionFn({ data: { editionId: edition.id, ...value } })),
  });

  return (
    <div className="container mx-auto flex max-w-3xl flex-col gap-12 px-4 py-16">
      <div className="flex flex-col gap-6">
        <BackLink to="/books/$bookId" params={{ bookId: book.id }}>
          {m.book_back_to({ title: book.title })}
        </BackLink>
        <header className="flex flex-col gap-2">
          <p className="text-overline text-muted-foreground uppercase">{book.title}</p>
          <h1>{m.book_edition_edit_title()}</h1>
          <span aria-hidden className="bg-gilt h-0.5 w-16" />
          <p className="text-muted-foreground mt-1">{m.book_edit_intro()}</p>
        </header>
      </div>

      <form
        className="flex flex-col gap-12"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        noValidate
      >
        <FieldGroup>
          <form.AppField name="isbn">
            {(field) => (
              <field.TextField
                inputMode="numeric"
                spellCheck={false}
                className="max-w-xs"
                label={m.book_isbn_label()}
                hint={m.book_isbn_hint()}
                error={m.book_isbn_invalid()}
              />
            )}
          </form.AppField>
          <EditionFormFields form={form} fields={editionFields} bookTitle={book.title} />
        </FieldGroup>
        <form.AppForm>
          <FormActions bookId={book.id} problem={problem} />
        </form.AppForm>
      </form>

      <DeleteSection
        id="edition-delete"
        title={m.book_edition_delete_heading()}
        description={
          book.editions.length === 1
            ? m.book_edition_delete_description_only()
            : m.book_edition_delete_description()
        }
        label={m.book_edition_delete()}
        question={m.book_edition_delete_confirm({ title: edition.title ?? book.title })}
        confirmLabel={m.book_edition_delete_confirm_button()}
        cancelLabel={m.book_edition_delete_cancel()}
        error={deletion.failed && m.book_edition_delete_failed()}
        pending={deletion.pending}
        onDelete={async () =>
          deletion.run(async () => deleteEditionFn({ data: { editionId: edition.id } }))
        }
      />
    </div>
  );
}
