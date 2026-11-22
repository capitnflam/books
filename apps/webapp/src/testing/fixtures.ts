import { PAGE_SIZE } from '#/utils/list-search';

import type { BookDetails, EditionDetails } from '#/services/catalog/book-details';
import type { listBooksFn, listIndexFn } from '#/services/catalog/catalog.functions';
import type {
  getFeatureFlagFn,
  listFeatureFlagsFn,
  listFlagCandidatesFn,
  listFlagHoldersFn,
} from '#/services/feature-flags/feature-flags.functions';
import type { getProfileFn } from '#/services/profile/profile.functions';
import type {
  getUserDetailsFn,
  listUsersFn,
} from '#/services/user-management/user-management.functions';

// What the server functions answer, as complete as the pages can show it. Tests override what
// they are about.

type Answer<Fn extends (...args: never[]) => Promise<unknown>> = NonNullable<
  Awaited<ReturnType<Fn>>
>;

/** The same id for the same number, in the form the pages accept. */
export const uuid = (number: number) =>
  `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;

/** The rows of one page of a list, as the server cuts it. */
export const pageOf = <Row>(rows: Row[], page = 1) =>
  rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

const createdAt = new Date(2026, 0, 15);

type ListedBook = Answer<typeof listBooksFn>['books'][number];

export const listedBook = (book: Partial<ListedBook> = {}): ListedBook => ({
  id: uuid(1),
  title: 'The Hobbit',
  subtitle: 'There and Back Again',
  firstPublishedYear: 1937,
  authors: ['J. R. R. Tolkien'],
  coverImageUrl: null,
  ...book,
});

export const edition = (values: Partial<EditionDetails> = {}): EditionDetails => ({
  id: uuid(10),
  bookId: uuid(1),
  title: null,
  subtitle: null,
  editionStatement: '2nd edition',
  publisherId: uuid(20),
  publisher: { id: uuid(20), name: 'Allen & Unwin' },
  publishedYear: 1951,
  publishedOn: '1951-07-19',
  isbn13: '9780261102217',
  isbn10: '0261102214',
  language: 'en',
  format: 'hardcover',
  pageCount: 310,
  durationMinutes: null,
  coverImageUrl: null,
  contributors: [],
  createdAt,
  updatedAt: createdAt,
  ...values,
});

type CreditedAs = BookDetails['book']['contributors'][number]['role'];

/** Someone credited on a book or an edition. */
export const credit = (name: string, role: CreditedAs = 'author', position = 0) => ({
  bookId: uuid(1),
  editionId: uuid(10),
  authorId: uuid(30 + position),
  role,
  position,
  author: { id: uuid(30 + position), name },
});

export const bookDetails = (
  book: Partial<BookDetails['book']> = {},
  { canEdit = false } = {},
): BookDetails => ({
  book: {
    id: uuid(1),
    title: 'The Hobbit',
    subtitle: 'There and Back Again',
    sortTitle: 'Hobbit, The',
    description: 'A hobbit leaves home.',
    originalLanguage: 'en',
    firstPublishedYear: 1937,
    contributors: [credit('J. R. R. Tolkien')],
    series: [
      {
        bookId: uuid(1),
        seriesId: uuid(40),
        position: 1,
        series: { id: uuid(40), name: 'Middle-earth', sortName: 'Middle-earth' },
      },
    ],
    subjects: [{ id: uuid(50), name: 'Dragons' }],
    genres: ['fantasy'],
    editions: [edition()],
    createdAt,
    updatedAt: createdAt,
    ...book,
  },
  can: { edit: canEdit },
});

type IndexEntry = Answer<typeof listIndexFn>['entries'][number];

export const indexEntry = (entry: Partial<IndexEntry> = {}): IndexEntry => ({
  id: uuid(30),
  name: 'J. R. R. Tolkien',
  bookCount: 2,
  ...entry,
});

type ListedFlag = Answer<typeof listFeatureFlagsFn>[number];

export const listedFlag = (flag: Partial<ListedFlag> = {}): ListedFlag => ({
  id: uuid(60),
  key: 'BOOK_SEARCH',
  description: 'Search inside books',
  createdAt,
  userCount: 3,
  ...flag,
});

type Flag = Answer<typeof getFeatureFlagFn>;

export const flagDetails = (flag: Partial<Flag> = {}): Flag => ({
  id: uuid(60),
  key: 'BOOK_SEARCH',
  description: 'Search inside books',
  createdAt,
  ...flag,
});

type Candidate = Answer<typeof listFlagCandidatesFn>['users'][number];

export const flagCandidate = (user: Partial<Candidate> = {}): Candidate => ({
  id: uuid(71),
  displayName: 'Grace Hopper',
  email: 'grace@example.com',
  imageUrl: '',
  ...user,
});

type Holder = Answer<typeof listFlagHoldersFn>['users'][number];

export const flagHolder = (user: Partial<Holder> = {}): Holder => ({
  id: uuid(72),
  displayName: 'Alan Turing',
  email: 'alan@example.com',
  imageUrl: '',
  grantedAt: createdAt,
  grantedBy: 'Ada Lovelace',
  ...user,
});

type Profile = Answer<typeof getProfileFn>;

export const profile = (values: Partial<Profile> = {}): Profile => ({
  user: {
    id: uuid(70),
    authenticationId: 'user_ada',
    displayName: 'Countess Lovelace',
    createdAt,
    updatedAt: createdAt,
  },
  account: { fullName: 'Ada Lovelace', email: 'ada@example.com', imageUrl: '' },
  role: {
    id: uuid(80),
    name: 'moderator',
    description: 'Looks after the catalogue',
    permissions: ['collection:manage', 'catalog:manage'],
    grantedAt: createdAt,
  },
  featureFlags: [{ id: uuid(60), key: 'BOOK_SEARCH', description: 'Search inside books' }],
  ...values,
});

type ListedUser = Answer<typeof listUsersFn>['users'][number];

export const listedUser = (user: Partial<ListedUser> = {}): ListedUser => ({
  id: uuid(71),
  displayName: 'Grace Hopper',
  email: 'grace@example.com',
  imageUrl: '',
  status: 'active',
  createdAt,
  role: { id: uuid(80), name: 'moderator' },
  ...user,
});

type UserDetails = Answer<typeof getUserDetailsFn>;

export const userDetails = (values: Partial<UserDetails> = {}): UserDetails => ({
  user: { id: uuid(71), displayName: 'Grace Hopper', createdAt },
  account: {
    fullName: 'Grace Brewster Hopper',
    email: 'grace@example.com',
    imageUrl: '',
    blocked: false,
    lastSignInAt: new Date(2026, 1, 20),
  },
  role: {
    id: uuid(80),
    name: 'moderator',
    description: 'Looks after the catalogue',
    permissions: ['collection:manage', 'catalog:manage'],
    grantedAt: createdAt,
    grantedBy: 'Ada Lovelace',
  },
  allRoles: [
    { id: uuid(81), name: 'admin', description: 'Runs the library' },
    { id: uuid(80), name: 'moderator', description: 'Looks after the catalogue' },
  ],
  isSelf: false,
  can: { manageUser: false, manageRoles: false },
  ...values,
});
