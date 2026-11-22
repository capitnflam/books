import { Button } from '@books/ui/components/button';
import { Field, FieldDescription, FieldLabel } from '@books/ui/components/field';
import { Icon } from '@books/ui/components/icon';
import { Input } from '@books/ui/components/input';
import { useRef, useState } from 'react';

import { useFieldContext } from '#/components/form/form-context';
import PageSection from '#/components/PageSection';
import TextLink from '#/components/TextLink';
import { m } from '#/paraglide/messages';
import { lookupIsbnFn } from '#/services/catalog/catalog.functions';

import type { FC, FormEvent } from 'react';

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

/** An answer to prefill the form with, or to empty it of the last one. */
export type FoundIsbn = Extract<LookupResult, { isbn: string }>;

type IsbnLookupProps = { onFound: (result: FoundIsbn) => void };

/** The form's ISBN, and the button that looks it up in the book catalogues. */
const IsbnLookup: FC<IsbnLookupProps> = ({ onFound }) => {
  const field = useFieldContext<string>();
  const isbn = field.state.value;
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' });
  // Counts lookups and ISBN edits: a response is applied only if nothing happened since its
  // request, so a slow answer for an ISBN that was then corrected can't overwrite the new one.
  const latestRequest = useRef(0);
  const invalid = field.state.meta.errors.length > 0 || lookup.status === 'invalid';
  const message = lookupMessages(invalid ? { status: 'invalid' } : lookup);

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

  return (
    <PageSection id="book-isbn-section" title={m.book_isbn_heading()}>
      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        <Field data-invalid={invalid ? true : undefined}>
          <FieldLabel htmlFor="book-isbn">{m.book_isbn_label()}</FieldLabel>
          <div className="flex flex-wrap gap-2">
            <Input
              id="book-isbn"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              className="max-w-xs flex-1"
              aria-invalid={invalid ? true : undefined}
              aria-describedby="book-isbn-hint book-isbn-status"
              value={isbn}
              onChange={(event) => {
                latestRequest.current += 1;
                field.handleChange(event.target.value);
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

export default IsbnLookup;
