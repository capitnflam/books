import { createFileRoute } from '@tanstack/react-router';

import BackLink from '#/components/BackLink';
import EditFormActions from '#/components/book-form/EditFormActions';
import SeriesField from '#/components/book-form/SeriesField';
import WorkFields from '#/components/book-form/WorkFields';
import BookNotFound from '#/components/BookNotFound';
import { useEditBookForm } from '#/hooks/use-edit-book-form';
import { m } from '#/paraglide/messages';
import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';
import { loadBookDetails } from '#/services/catalog/book-details';
import { WORK_CREDIT_ROLES, workFormErrors, workFormOf } from '#/services/catalog/catalog';
import { updateBookFn } from '#/services/catalog/catalog.functions';

export const Route = createFileRoute('/_app/books/$bookId/edit')({
  beforeLoad: async ({ location }) => {
    // The server functions the page calls check the permission again on their own.
    await checkPermissionFn({
      data: { permission: 'catalog:manage', redirect_url: localizeHref(location.href) },
    });
  },
  loader: async ({ params }) => loadBookDetails(params),
  // The form is filled in once, from this: never from what an earlier visit loaded.
  gcTime: 0,
  preloadGcTime: 0,
  head: () => ({ meta: [{ title: m.book_edit_title() }] }),
  notFoundComponent: BookNotFound,
  component: EditBookPage,
});

function EditBookPage() {
  const { book } = Route.useLoaderData();
  const { form, update, errors, status, taken, handleSubmit } = useEditBookForm({
    bookId: book.id,
    initial: workFormOf(book),
    errorsOf: workFormErrors,
    save: (data) => updateBookFn({ data: { bookId: book.id, ...data } }),
  });

  return (
    <div className="container mx-auto flex max-w-3xl flex-col gap-12 px-4 py-16">
      <div className="flex flex-col gap-6">
        <BackLink to="/books/$bookId" params={{ bookId: book.id }}>
          {m.book_back_to({ title: book.title })}
        </BackLink>
        <header className="flex flex-col gap-2">
          <p className="text-overline text-muted-foreground uppercase">{m.books_title()}</p>
          <h1>{m.book_edit_title()}</h1>
          <span aria-hidden className="bg-gilt h-0.5 w-16" />
          <p className="text-muted-foreground mt-1">{m.book_edit_intro()}</p>
        </header>
      </div>

      <form
        className="flex flex-col gap-12"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <WorkFields
          form={form}
          errors={errors}
          contributorsHint={m.book_edit_contributors_hint()}
          contributorRoles={WORK_CREDIT_ROLES}
          series={
            <SeriesField
              series={form.series}
              errors={errors}
              onChange={(series) => update({ series })}
            />
          }
          onChange={update}
        />
        <EditFormActions bookId={book.id} invalid={errors.size > 0} status={status} taken={taken} />
      </form>
    </div>
  );
}
