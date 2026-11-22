import { createFieldMap } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';

import BackLink from '#/components/BackLink';
import EditFormActions from '#/components/book-form/EditFormActions';
import SeriesFields from '#/components/book-form/SeriesFields';
import WorkFields from '#/components/book-form/WorkFields';
import BookNotFound from '#/components/BookNotFound';
import DeleteSection from '#/components/DeleteSection';
import { useAppForm } from '#/hooks/use-app-form';
import { useDeleteFromCatalog } from '#/hooks/use-delete-from-catalog';
import { useSaveBook } from '#/hooks/use-save-book';
import { m } from '#/paraglide/messages';
import { localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';
import { loadBookDetails } from '#/services/catalog/book-details';
import {
  WORK_CREDIT_ROLES,
  emptyWorkValues,
  workFormErrors,
  workFormOf,
} from '#/services/catalog/catalog';
import { deleteBookFn, updateBookFn } from '#/services/catalog/catalog.functions';
import { checkedOnSubmit } from '#/utils/form-validation';

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

const workFields = createFieldMap(emptyWorkValues());

function EditBookPage() {
  const { book } = Route.useLoaderData();
  const { problem, save } = useSaveBook(book.id);
  const deletion = useDeleteFromCatalog({ to: '/books' });
  const form = useAppForm({
    defaultValues: workFormOf(book),
    ...checkedOnSubmit(workFormErrors),
    onSubmit: async ({ value }) =>
      save(async () => updateBookFn({ data: { bookId: book.id, ...value } })),
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
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        noValidate
      >
        <WorkFields
          form={form}
          fields={workFields}
          contributorsHint={m.book_edit_contributors_hint()}
          contributorRoles={WORK_CREDIT_ROLES}
          series={<SeriesFields form={form} fields={{ series: 'series' }} />}
        />
        <form.AppForm>
          <EditFormActions bookId={book.id} problem={problem} />
        </form.AppForm>
      </form>

      <DeleteSection
        id="book-delete"
        title={m.book_delete_heading()}
        description={m.book_delete_description()}
        label={m.book_delete()}
        question={m.book_delete_confirm({ title: book.title, count: book.editions.length })}
        confirmLabel={m.book_delete_confirm_button()}
        cancelLabel={m.book_delete_cancel()}
        error={deletion.failed && m.book_delete_failed()}
        pending={deletion.pending}
        onDelete={async () => deletion.run(async () => deleteBookFn({ data: { bookId: book.id } }))}
      />
    </div>
  );
}
