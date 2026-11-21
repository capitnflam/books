/** An edition's ISBNs, digits only: every valid ISBN has a 13-digit form, and some a 10-digit one. */
export type Isbns = { isbn13: string; isbn10: string | null };

/** The ISBN as typed, without the spaces and hyphens printed in it; a final `x` is capitalised. */
export function normalizeIsbn(input: string): string {
  return input.replaceAll(/[\s\-‐‑–]/gu, '').toUpperCase();
}

const digitsOf = (isbn: string) => [...isbn].map((char) => (char === 'X' ? 10 : Number(char)));

function isIsbn10(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/u.test(isbn)) {
    return false;
  }

  const sum = digitsOf(isbn).reduce((total, digit, index) => total + digit * (10 - index), 0);

  return sum % 11 === 0;
}

function isbn13CheckDigit(first12: string): string {
  const sum = digitsOf(first12).reduce(
    (total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3),
    0,
  );

  return String((10 - (sum % 10)) % 10);
}

function isIsbn13(isbn: string): boolean {
  return /^97[89]\d{10}$/u.test(isbn) && isbn13CheckDigit(isbn.slice(0, 12)) === isbn[12];
}

function isbn10CheckDigit(first9: string): string {
  const sum = digitsOf(first9).reduce((total, digit, index) => total + digit * (10 - index), 0);
  const check = (11 - (sum % 11)) % 11;

  return check === 10 ? 'X' : String(check);
}

/**
 * Both forms of an ISBN typed as either, or null when it is not a valid ISBN (wrong length or
 * check digit). Only `978` ISBN-13s have an ISBN-10: `979` ones were never given one.
 */
export function parseIsbn(input: string): Isbns | null {
  const isbn = normalizeIsbn(input);

  if (isIsbn13(isbn)) {
    const isbn10 = isbn.startsWith('978')
      ? isbn.slice(3, 12) + isbn10CheckDigit(isbn.slice(3, 12))
      : null;

    return { isbn13: isbn, isbn10 };
  }

  if (isIsbn10(isbn)) {
    const first12 = `978${isbn.slice(0, 9)}`;

    return { isbn13: first12 + isbn13CheckDigit(first12), isbn10: isbn };
  }

  return null;
}
