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
import { Field, FieldDescription, FieldError, FieldLabel } from '@books/ui/components/field';
import { useState } from 'react';

import { m } from '#/paraglide/messages';
import { getLocale } from '#/paraglide/runtime';
import { GENRES, genreAliases, genreLabel } from '#/services/catalog/genres';
import { fuzzyFilter } from '#/utils/fuzzy-search';

import type { Genre } from '@books/database';
import type { FC } from 'react';

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

export default GenresField;
