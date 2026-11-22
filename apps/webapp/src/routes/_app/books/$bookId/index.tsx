import { buttonVariants } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { Link, createFileRoute } from '@tanstack/react-router';

import BackLink from '#/components/BackLink';
import BookCover from '#/components/BookCover';
import BookNotFound from '#/components/BookNotFound';
import PageSection from '#/components/PageSection';
import { m } from '#/paraglide/messages';
import { loadBookDetails } from '#/services/catalog/book-details';
import { CONTRIBUTOR_ROLES } from '#/services/catalog/catalog';
import { genreLabel } from '#/services/catalog/genres';
import { formatLabel, languageName, roleLabel } from '#/services/catalog/labels';
import { formatDay, formatYear } from '#/utils/dates';
import { formatList } from '#/utils/format-list';

import type { BookDetails, EditionDetails } from '#/services/catalog/book-details';
import type { ContributorRole } from '@books/database';
import type { FC } from 'react';

export const Route = createFileRoute('/_app/books/$bookId/')({
  loader: async ({ params }) => loadBookDetails(params),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? loaderData.book.title : m.books_title() }],
  }),
  notFoundComponent: BookNotFound,
  component: BookPage,
});

type Fact = { label: string; value: string };

/** Facts about a book or an edition; those without a value are left out. */
const Facts: FC<{ facts: (Fact | false)[] }> = ({ facts }) => {
  const known = facts.filter((fact) => fact !== false);

  return (
    known.length > 0 && (
      <dl className="grid gap-x-6 gap-y-3 text-base/6 sm:grid-cols-2">
        {known.map(({ label, value }) => (
          <div key={label} className="flex min-w-0 flex-col">
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="break-words">{value}</dd>
          </div>
        ))}
      </dl>
    )
  );
};

type Credits = readonly { role: ContributorRole; author: { name: string } }[];

/** The names credited in each role, one fact per role. */
const creditFacts = (credits: Credits, roles: readonly ContributorRole[]): (Fact | false)[] =>
  roles.map((role) => {
    const names = credits.filter((credit) => credit.role === role).map(({ author }) => author.name);

    return names.length > 0 && { label: roleLabel(role), value: formatList(names) };
  });

function publishedDate({ publishedOn, publishedYear }: EditionDetails) {
  if (publishedOn) {
    return formatDay(publishedOn);
  }

  return publishedYear === null ? null : formatYear(publishedYear);
}

type EditionCardProps = {
  book: BookDetails['book'];
  edition: EditionDetails;
  canEdit: boolean;
};

const EditionCard: FC<EditionCardProps> = ({ book, edition, canEdit }) => {
  const title = edition.title ?? book.title;
  const headingId = `edition-${edition.id}`;
  const published = publishedDate(edition);
  const isbns = [edition.isbn13, edition.isbn10].filter((isbn) => isbn !== null);

  return (
    <li className="bg-card shadow-page border-border flex flex-wrap gap-6 rounded-md border px-5 py-5">
      <BookCover
        url={edition.coverImageUrl}
        alt={m.book_cover_alt({ title })}
        className="h-36 w-auto max-w-28 self-start"
      />
      <div className="flex min-w-0 flex-1 basis-72 flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-col">
            <h3 id={headingId}>{title}</h3>
            {edition.subtitle && <p className="text-muted-foreground">{edition.subtitle}</p>}
          </div>
          {canEdit && (
            <Link
              to="/books/$bookId/editions/$editionId/edit"
              params={{ bookId: book.id, editionId: edition.id }}
              aria-describedby={headingId}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <Icon icon="pencil" aria-hidden data-icon="inline-start" />
              {m.book_edition_edit()}
            </Link>
          )}
        </div>
        <Facts
          facts={[
            edition.editionStatement !== null && {
              label: m.book_edition_statement_label(),
              value: edition.editionStatement,
            },
            edition.publisher !== null && {
              label: m.book_publisher_label(),
              value: edition.publisher.name,
            },
            published !== null && { label: m.book_published_label(), value: published },
            edition.format !== null && {
              label: m.book_format_label(),
              value: formatLabel(edition.format),
            },
            edition.pageCount !== null && {
              label: m.book_page_count_label(),
              value: String(edition.pageCount),
            },
            edition.durationMinutes !== null && {
              label: m.book_duration_label(),
              value: String(edition.durationMinutes),
            },
            edition.language !== null && {
              label: m.book_language_label(),
              value: languageName(edition.language),
            },
            isbns.length > 0 && { label: m.book_isbn_label(), value: isbns.join(' · ') },
            ...creditFacts(edition.contributors, CONTRIBUTOR_ROLES),
          ]}
        />
      </div>
    </li>
  );
};

function BookPage() {
  const { book, can } = Route.useLoaderData();
  const authors = book.contributors
    .filter(({ role }) => role === 'author')
    .map(({ author }) => author.name);
  const cover = book.editions.find(({ coverImageUrl }) => coverImageUrl)?.coverImageUrl ?? null;

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-12 px-4 py-16">
      <div className="flex flex-col gap-6">
        <BackLink to="/books">{m.book_back()}</BackLink>
        <header className="flex flex-wrap items-start gap-x-8 gap-y-6">
          <BookCover url={cover} alt={m.book_cover_alt({ title: book.title })} />
          <div className="flex min-w-0 flex-1 basis-80 flex-col gap-2">
            <p className="text-overline text-muted-foreground uppercase">{m.books_title()}</p>
            <h1 className="break-words">{book.title}</h1>
            {book.subtitle && (
              <p className="text-heading-3 text-muted-foreground font-heading">{book.subtitle}</p>
            )}
            <span aria-hidden className="bg-gilt h-0.5 w-16" />
            {authors.length > 0 && (
              <p className="mt-1">{m.book_by({ names: formatList(authors) })}</p>
            )}
            {book.genres.length > 0 && (
              <ul aria-label={m.book_genres_legend()} className="mt-1 flex flex-wrap gap-2">
                {book.genres.map((genre) => (
                  <li
                    key={genre}
                    className="bg-accent text-accent-foreground rounded-sm px-2 py-0.5 text-sm font-medium"
                  >
                    {genreLabel(genre)}
                  </li>
                ))}
              </ul>
            )}
            {can.edit && (
              <Link
                to="/books/$bookId/edit"
                params={{ bookId: book.id }}
                className={buttonVariants({ className: 'mt-4 self-start' })}
              >
                <Icon icon="pencil" aria-hidden data-icon="inline-start" />
                {m.book_edit()}
              </Link>
            )}
          </div>
        </header>
      </div>

      <PageSection id="book-about" title={m.book_about_heading()}>
        {book.description && <p className="max-w-prose whitespace-pre-line">{book.description}</p>}
        <Facts
          facts={[
            book.firstPublishedYear !== null && {
              label: m.book_first_published_label(),
              value: formatYear(book.firstPublishedYear),
            },
            book.originalLanguage !== null && {
              label: m.book_original_language_label(),
              value: languageName(book.originalLanguage),
            },
            ...creditFacts(
              book.contributors,
              CONTRIBUTOR_ROLES.filter((role) => role !== 'author'),
            ),
            book.series.length > 0 && {
              label: m.book_series_label(),
              value: book.series
                .map(({ series, position }) =>
                  position === null
                    ? series.name
                    : m.book_series_numbered({ name: series.name, position }),
                )
                .join(' · '),
            },
            book.subjects.length > 0 && {
              label: m.book_subjects_label(),
              value: book.subjects.map(({ name }) => name).join(', '),
            },
          ]}
        />
      </PageSection>

      <PageSection
        id="book-editions"
        title={m.book_editions_heading({ count: book.editions.length })}
      >
        {book.editions.length === 0 ? (
          <p className="text-muted-foreground text-base/6">{m.book_editions_empty()}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {book.editions.map((edition) => (
              <EditionCard key={edition.id} book={book} edition={edition} canEdit={can.edit} />
            ))}
          </ul>
        )}
      </PageSection>
    </div>
  );
}
