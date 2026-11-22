import { FieldGroup } from '@books/ui/components/field';
import { Input } from '@books/ui/components/input';
import { createFileRoute, notFound } from '@tanstack/react-router';

import BackLink from '#/components/BackLink';
import ContributorsField from '#/components/book-form/ContributorsField';
import EditFormActions from '#/components/book-form/EditFormActions';
import EditionFields from '#/components/book-form/EditionFields';
import FormField from '#/components/book-form/FormField';
import BookNotFound from '#/components/BookNotFound';
import { useEditBookForm } from '#/hooks/use-edit-book-form';
import { m } from '#/paraglide/messages';
import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';
import { loadBookDetails } from '#/services/catalog/book-details';
import {
  BOOK_TITLE_MAX_LENGTH,
  EDITION_CREDIT_ROLES,
  editionFormErrors,
  editionFormOf,
} from '#/services/catalog/catalog';
import { updateEditionFn } from '#/services/catalog/catalog.functions';

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

function EditEditionPage() {
  const { book, edition } = Route.useLoaderData();
  const { form, update, errors, status, taken, handleSubmit } = useEditBookForm({
    bookId: book.id,
    initial: editionFormOf(edition),
    errorsOf: editionFormErrors,
    save: (data) => updateEditionFn({ data: { editionId: edition.id, ...data } }),
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
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <FieldGroup>
          <FormField
            name="isbn"
            label={m.book_isbn_label()}
            hint={m.book_isbn_hint()}
            error={errors.has('isbn') && m.book_isbn_invalid()}
          >
            {(props) => (
              <Input
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                className="max-w-xs"
                value={form.isbn}
                onChange={(event) => update({ isbn: event.target.value })}
                {...props}
              />
            )}
          </FormField>
          <FormField
            name="edition-title"
            label={m.book_edition_title_label()}
            hint={m.book_edition_title_hint()}
            error={
              errors.has('title') && m.book_edition_title_error({ max: BOOK_TITLE_MAX_LENGTH })
            }
          >
            {(props) => (
              <Input
                autoComplete="off"
                value={form.title}
                onChange={(event) => update({ title: event.target.value })}
                {...props}
              />
            )}
          </FormField>
          <FormField
            name="edition-subtitle"
            label={m.book_edition_subtitle_label()}
            error={errors.has('subtitle') && m.book_subtitle_error({ max: BOOK_TITLE_MAX_LENGTH })}
          >
            {(props) => (
              <Input
                autoComplete="off"
                value={form.subtitle}
                onChange={(event) => update({ subtitle: event.target.value })}
                {...props}
              />
            )}
          </FormField>
          <ContributorsField
            contributors={form.contributors}
            hint={m.book_edition_contributors_hint()}
            roles={EDITION_CREDIT_ROLES}
            invalid={(index) => errors.has(`contributors.${index}.name`)}
            tooMany={errors.has('contributors')}
            onChange={(contributors) => update({ contributors })}
          />
          <EditionFields
            form={form}
            errors={errors}
            title={form.title || book.title}
            onChange={update}
          />
        </FieldGroup>
        <EditFormActions bookId={book.id} invalid={errors.size > 0} status={status} taken={taken} />
      </form>
    </div>
  );
}
