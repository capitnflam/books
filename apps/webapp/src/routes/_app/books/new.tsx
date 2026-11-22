import { Button } from '@books/ui/components/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@books/ui/components/combobox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { IconButton } from '@books/ui/components/icon-button';
import { Input } from '@books/ui/components/input';
import { NativeSelect, NativeSelectOption } from '@books/ui/components/native-select';
import { Textarea } from '@books/ui/components/textarea';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import ErrorMessage from '#/components/ErrorMessage';
import PageSection from '#/components/PageSection';
import { m } from '#/paraglide/messages';
import { getLocale, localizeHref } from '#/paraglide/runtime';
import { checkPermissionFn } from '#/services/access/access.functions';
import {
  BOOK_DESCRIPTION_MAX_LENGTH,
  BOOK_TITLE_MAX_LENGTH,
  CONTRIBUTORS_MAX,
  CONTRIBUTOR_ROLES,
  EDITION_FORMATS,
  LANGUAGE_OPTIONS,
  bookFormErrors,
  emptyBookForm,
  applyLookup,
  emptyContributor,
} from '#/services/catalog/catalog';
import { createBookFn, lookupIsbnFn } from '#/services/catalog/catalog.functions';
import { GENRES, genreAliases, genreLabel } from '#/services/catalog/genres';
import { fuzzyFilter } from '#/utils/fuzzy-search';

import type { BookDraft, BookForm, ContributorForm } from '#/services/catalog/catalog';
import type { ContributorRole, EditionFormat, Genre } from '@books/database';
import type { NativeSelectProps } from '@books/ui/components/native-select';
import type { ChangeEvent, FC, FormEvent, ReactNode } from 'react';

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

const roleLabels: Record<ContributorRole, () => string> = {
  author: m.book_role_author,
  editor: m.book_role_editor,
  illustrator: m.book_role_illustrator,
  introduction: m.book_role_introduction,
  translator: m.book_role_translator,
  narrator: m.book_role_narrator,
};

const formatLabels: Record<EditionFormat, () => string> = {
  hardcover: m.book_format_hardcover,
  paperback: m.book_format_paperback,
  mass_market_paperback: m.book_format_mass_market_paperback,
  ebook: m.book_format_ebook,
  audiobook: m.book_format_audiobook,
  other: m.book_format_other,
};

/** A language's name in the page's language: `de` is "German" in English, "allemand" in French. */
function languageName(tag: string) {
  try {
    return new Intl.DisplayNames([getLocale()], { type: 'language' }).of(tag) ?? tag;
  } catch {
    return tag;
  }
}

/** The menu's languages, sorted by name, with `current` added when it is not one of them. */
function languageOptions(current: string) {
  const tags: string[] = [...LANGUAGE_OPTIONS];

  if (current && !tags.includes(current)) {
    tags.push(current);
  }

  return tags
    .map((tag) => ({ tag, name: languageName(tag) }))
    .toSorted((a, b) => a.name.localeCompare(b.name, getLocale()));
}

type FormFieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string | false;
  children: (props: {
    id: string;
    'aria-invalid'?: true;
    'aria-describedby'?: string;
  }) => ReactNode;
};

/** A labelled control with its hint and error, wired together for screen readers. */
const FormField: FC<FormFieldProps> = ({ name, label, hint, error, children }) => {
  const id = `book-${name}`;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': hint ? `${id}-hint` : undefined,
      })}
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
};

type LanguageSelectProps = Omit<NativeSelectProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
};

const LanguageSelect: FC<LanguageSelectProps> = ({ value, onChange, ...props }) => (
  <NativeSelect
    className="w-full"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    {...props}
  >
    <NativeSelectOption value="">{m.book_language_unknown()}</NativeSelectOption>
    {languageOptions(value).map(({ tag, name }) => (
      <NativeSelectOption key={tag} value={tag}>
        {name}
      </NativeSelectOption>
    ))}
  </NativeSelect>
);

/**
 * The book's genres as chips, chosen from a list sorted by name in the page's language. Typing
 * searches names and other words for them (`theatre` finds Drama) forgivingly (`mistery`), best
 * matches first; at least one is required.
 */
const GenresField: FC<{
  genres: Genre[];
  invalid: boolean;
  onChange: (genres: Genre[]) => void;
}> = ({ genres, invalid, onChange }) => {
  const anchor = useComboboxAnchor();
  const [query, setQuery] = useState('');
  const options = GENRES.toSorted((a, b) =>
    genreLabel(a).localeCompare(genreLabel(b), getLocale()),
  );

  return (
    <Field data-invalid={invalid ? true : undefined}>
      <FieldLabel id="book-genres-label" htmlFor="book-genres">
        {m.book_genres_legend()}
      </FieldLabel>
      <Combobox
        multiple
        autoHighlight
        items={options}
        // Ranked by the fuzzy search instead of Base UI's own substring filter.
        filteredItems={fuzzyFilter(options, query, genreLabel, genreAliases)}
        inputValue={query}
        onInputValueChange={setQuery}
        value={genres}
        itemToStringLabel={genreLabel}
        onValueChange={onChange}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(chosen: Genre[]) => (
              <>
                {chosen.map((genre) => (
                  <ComboboxChip
                    key={genre}
                    removeLabel={m.book_genre_remove({ genre: genreLabel(genre) })}
                  >
                    {genreLabel(genre)}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id="book-genres"
                  // Base UI also renders a hidden input, so name this one from the label directly.
                  aria-labelledby="book-genres-label"
                  aria-describedby={
                    invalid ? 'book-genres-hint book-genres-error' : 'book-genres-hint'
                  }
                  aria-invalid={invalid ? true : undefined}
                  placeholder={chosen.length === 0 ? m.book_genres_placeholder() : undefined}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>{m.book_genres_empty()}</ComboboxEmpty>
          <ComboboxList aria-labelledby="book-genres-label">
            {(genre: Genre) => (
              <ComboboxItem key={genre} value={genre}>
                {genreLabel(genre)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription id="book-genres-hint">{m.book_genres_hint()}</FieldDescription>
      {invalid && <FieldError id="book-genres-error">{m.book_genres_error()}</FieldError>}
    </Field>
  );
};

const ContributorsField: FC<{
  contributors: ContributorForm[];
  invalid: (index: number) => boolean;
  /** More rows than the server takes. */
  tooMany: boolean;
  onChange: (contributors: ContributorForm[]) => void;
}> = ({ contributors, invalid, tooMany, onChange }) => {
  const update = (index: number, change: Partial<ContributorForm>) =>
    onChange(contributors.map((row, at) => (at === index ? { ...row, ...change } : row)));

  return (
    <FieldSet>
      <FieldLegend variant="label">{m.book_contributors_legend()}</FieldLegend>
      <FieldDescription id="book-contributors-hint">{m.book_contributors_hint()}</FieldDescription>
      <ul className="flex flex-col gap-3">
        {contributors.map((contributor, index) => {
          const number = index + 1;
          const error = invalid(index);

          return (
            // Rows have no id of their own; they are only ever added and removed by position.
            // oxlint-disable-next-line react/no-array-index-key
            <li key={index} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  aria-label={m.book_contributor_name({ number })}
                  aria-describedby="book-contributors-hint"
                  aria-invalid={error ? true : undefined}
                  autoComplete="off"
                  className="min-w-48 flex-1"
                  value={contributor.name}
                  onChange={(event) => update(index, { name: event.target.value })}
                />
                <NativeSelect
                  aria-label={m.book_contributor_role({ number })}
                  className="w-44"
                  value={contributor.role}
                  onChange={(event) =>
                    update(index, { role: event.target.value as ContributorRole })
                  }
                >
                  {CONTRIBUTOR_ROLES.map((role) => (
                    <NativeSelectOption key={role} value={role}>
                      {roleLabels[role]()}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <IconButton
                  variant="ghost"
                  icon="trash"
                  label={m.book_contributor_remove({ number })}
                  disabled={contributors.length === 1 && !contributor.name}
                  onClick={() =>
                    onChange(
                      contributors.length === 1
                        ? [emptyContributor()]
                        : contributors.filter((_, at) => at !== index),
                    )
                  }
                />
              </div>
              {error && <FieldError>{m.book_contributor_error()}</FieldError>}
            </li>
          );
        })}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...contributors, emptyContributor()])}
      >
        <Icon icon="plus" aria-hidden data-icon="inline-start" />
        {m.book_contributor_add()}
      </Button>
      {tooMany && (
        <FieldError>{m.book_contributors_too_many({ max: CONTRIBUTORS_MAX })}</FieldError>
      )}
    </FieldSet>
  );
};

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
        </Field>
        <div id="book-isbn-status" role="status" className="mt-3 empty:hidden">
          {message
            && (message.error ? (
              <p className="text-destructive flex items-center gap-2 text-base/6">
                <Icon icon="alert-circle" aria-hidden className="size-5 shrink-0" />
                {message.text}
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

const CoverPreview: FC<{ url: string; title: string }> = ({ url, title }) => {
  // The address that failed to load: a new one may load.
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

  if (!/^https?:\/\/\S+$/u.test(url) || brokenUrl === url) {
    return null;
  }

  return (
    <img
      src={url}
      alt={title ? m.book_cover_alt({ title }) : ''}
      className="shadow-page h-48 w-auto self-start rounded-sm object-contain"
      onError={() => setBrokenUrl(url)}
    />
  );
};

const Created: FC<{ title: string; onAddAnother: () => void }> = ({ title, onAddAnother }) => {
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
      <Button onClick={onAddAnother}>
        <Icon icon="plus" aria-hidden data-icon="inline-start" />
        {m.book_add_another()}
      </Button>
    </section>
  );
};

function NewBookPage() {
  const [form, setForm] = useState<BookForm>(emptyBookForm);
  // Fields are checked once the form has been sent, then again as they change.
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'failed'>('idle');
  const [taken, setTaken] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  // Remounts the ISBN lookup, clearing its message, when a new book is started.
  const [formKey, setFormKey] = useState(0);
  // What the last lookup filled in, to empty it if another book is looked up.
  const [prefilled, setPrefilled] = useState<BookDraft | null>(null);

  const errors = submitted ? bookFormErrors(form) : new Set<string>();
  const set =
    <K extends keyof BookForm>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));
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
        setTaken(result.title);
        setStatus('idle');

        return;
      }

      setCreated(result.title);
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
        <Created title={created} onAddAnother={startOver} />
      ) : (
        <>
          <IsbnLookup
            key={formKey}
            isbn={form.isbn}
            invalid={errors.has('isbn')}
            onIsbnChange={(isbn) => setForm((current) => ({ ...current, isbn }))}
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
              <FieldGroup>
                <FormField
                  name="title"
                  label={m.book_title_label()}
                  error={error('title', m.book_title_error({ max: BOOK_TITLE_MAX_LENGTH }))}
                >
                  {(props) => (
                    <Input
                      autoComplete="off"
                      value={form.title}
                      onChange={set('title')}
                      {...props}
                    />
                  )}
                </FormField>
                <FormField
                  name="subtitle"
                  label={m.book_subtitle_label()}
                  error={error('subtitle', m.book_subtitle_error({ max: BOOK_TITLE_MAX_LENGTH }))}
                >
                  {(props) => (
                    <Input
                      autoComplete="off"
                      value={form.subtitle}
                      onChange={set('subtitle')}
                      {...props}
                    />
                  )}
                </FormField>
                <ContributorsField
                  contributors={form.contributors}
                  invalid={(index) => errors.has(`contributors.${index}.name`)}
                  tooMany={errors.has('contributors')}
                  onChange={(contributors) => setForm((current) => ({ ...current, contributors }))}
                />
                <FormField
                  name="description"
                  label={m.book_description_label()}
                  error={error(
                    'description',
                    m.book_description_error({ max: BOOK_DESCRIPTION_MAX_LENGTH }),
                  )}
                >
                  {(props) => (
                    <Textarea
                      rows={5}
                      className="max-h-96"
                      value={form.description}
                      onChange={set('description')}
                      {...props}
                    />
                  )}
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    name="original-language"
                    label={m.book_original_language_label()}
                    error={error('originalLanguage', m.book_language_error())}
                  >
                    {(props) => (
                      <LanguageSelect
                        value={form.originalLanguage}
                        onChange={(originalLanguage) =>
                          setForm((current) => ({ ...current, originalLanguage }))
                        }
                        {...props}
                      />
                    )}
                  </FormField>
                  <FormField
                    name="first-published"
                    label={m.book_first_published_label()}
                    hint={m.book_first_published_hint()}
                    error={error('firstPublishedYear', m.book_first_published_error())}
                  >
                    {(props) => (
                      <Input
                        inputMode="numeric"
                        autoComplete="off"
                        value={form.firstPublishedYear}
                        onChange={set('firstPublishedYear')}
                        {...props}
                      />
                    )}
                  </FormField>
                </div>
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
                        onChange={set('series')}
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
                        onChange={set('seriesPosition')}
                        {...props}
                      />
                    )}
                  </FormField>
                </div>
                <GenresField
                  genres={form.genres}
                  invalid={errors.has('genres')}
                  onChange={(genres) => setForm((current) => ({ ...current, genres }))}
                />
                <FormField
                  name="subjects"
                  label={m.book_subjects_label()}
                  hint={m.book_subjects_hint()}
                  error={error('subjects', m.book_subjects_error())}
                >
                  {(props) => (
                    <Input
                      autoComplete="off"
                      value={form.subjects}
                      onChange={set('subjects')}
                      {...props}
                    />
                  )}
                </FormField>
              </FieldGroup>
            </PageSection>

            <PageSection
              id="book-edition-section"
              title={m.book_edition_heading()}
              description={m.book_edition_description()}
            >
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    name="publisher"
                    label={m.book_publisher_label()}
                    error={error('publisher', m.book_text_error())}
                  >
                    {(props) => (
                      <Input
                        autoComplete="off"
                        value={form.publisher}
                        onChange={set('publisher')}
                        {...props}
                      />
                    )}
                  </FormField>
                  <FormField
                    name="published"
                    label={m.book_published_label()}
                    hint={m.book_published_hint()}
                    error={error('published', m.book_published_error())}
                  >
                    {(props) => (
                      <Input
                        autoComplete="off"
                        value={form.published}
                        onChange={set('published')}
                        {...props}
                      />
                    )}
                  </FormField>
                  <FormField
                    name="edition-statement"
                    label={m.book_edition_statement_label()}
                    hint={m.book_edition_statement_hint()}
                    error={error('editionStatement', m.book_text_error())}
                  >
                    {(props) => (
                      <Input
                        autoComplete="off"
                        value={form.editionStatement}
                        onChange={set('editionStatement')}
                        {...props}
                      />
                    )}
                  </FormField>
                  <FormField
                    name="language"
                    label={m.book_language_label()}
                    error={error('language', m.book_language_error())}
                  >
                    {(props) => (
                      <LanguageSelect
                        value={form.language}
                        onChange={(language) => setForm((current) => ({ ...current, language }))}
                        {...props}
                      />
                    )}
                  </FormField>
                  <FormField name="format" label={m.book_format_label()}>
                    {(props) => (
                      <NativeSelect
                        className="w-full"
                        value={form.format}
                        onChange={set('format')}
                        {...props}
                      >
                        <NativeSelectOption value="">{m.book_format_unknown()}</NativeSelectOption>
                        {EDITION_FORMATS.map((format) => (
                          <NativeSelectOption key={format} value={format}>
                            {formatLabels[format]()}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    )}
                  </FormField>
                  {form.format === 'audiobook' ? (
                    <FormField
                      name="duration"
                      label={m.book_duration_label()}
                      error={error('durationMinutes', m.book_number_error())}
                    >
                      {(props) => (
                        <Input
                          inputMode="numeric"
                          autoComplete="off"
                          value={form.durationMinutes}
                          onChange={set('durationMinutes')}
                          {...props}
                        />
                      )}
                    </FormField>
                  ) : (
                    <FormField
                      name="page-count"
                      label={m.book_page_count_label()}
                      error={error('pageCount', m.book_number_error())}
                    >
                      {(props) => (
                        <Input
                          inputMode="numeric"
                          autoComplete="off"
                          value={form.pageCount}
                          onChange={set('pageCount')}
                          {...props}
                        />
                      )}
                    </FormField>
                  )}
                </div>
                <FormField
                  name="cover"
                  label={m.book_cover_label()}
                  hint={m.book_cover_hint()}
                  error={error('coverImageUrl', m.book_cover_error())}
                >
                  {(props) => (
                    <Input
                      type="url"
                      autoComplete="off"
                      spellCheck={false}
                      value={form.coverImageUrl}
                      onChange={set('coverImageUrl')}
                      {...props}
                    />
                  )}
                </FormField>
                <CoverPreview url={form.coverImageUrl} title={form.title} />
              </FieldGroup>
            </PageSection>

            <div className="flex flex-wrap-reverse items-center justify-end gap-4">
              {errors.size > 0 && <ErrorMessage>{m.book_form_invalid()}</ErrorMessage>}
              {taken !== null && <ErrorMessage>{m.book_isbn_taken({ title: taken })}</ErrorMessage>}
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
