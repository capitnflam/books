import { m } from '#/paraglide/messages';
import { getLocale } from '#/paraglide/runtime';

import type { ContributorRole, EditionFormat } from '@books/database';

const roleLabels: Record<ContributorRole, () => string> = {
  author: m.book_role_author,
  editor: m.book_role_editor,
  illustrator: m.book_role_illustrator,
  introduction: m.book_role_introduction,
  translator: m.book_role_translator,
  narrator: m.book_role_narrator,
};

/** What someone did on a book or an edition, in the page's language. */
export const roleLabel = (role: ContributorRole) => roleLabels[role]();

const formatLabels: Record<EditionFormat, () => string> = {
  hardcover: m.book_format_hardcover,
  paperback: m.book_format_paperback,
  mass_market_paperback: m.book_format_mass_market_paperback,
  ebook: m.book_format_ebook,
  audiobook: m.book_format_audiobook,
  other: m.book_format_other,
};

/** An edition's format in the page's language. */
export const formatLabel = (format: EditionFormat) => formatLabels[format]();

/** A language's name in the page's language: `de` is "German" in English, "allemand" in French. */
export function languageName(tag: string) {
  try {
    return new Intl.DisplayNames([getLocale()], { type: 'language' }).of(tag) ?? tag;
  } catch {
    return tag;
  }
}
