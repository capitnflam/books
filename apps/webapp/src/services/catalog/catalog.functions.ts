import { createServerFn } from '@tanstack/react-start';

import { getServerEnv } from '#/config/env';
import { listSearchSchema } from '#/utils/list-search';

import {
  bookIdSchema,
  createBookSchema,
  editionIdSchema,
  lookupIsbnSchema,
  updateBookSchema,
  updateEditionSchema,
} from './catalog';
import { getBookServer, listBooksServer } from './catalog-browse.server';
import { indexEntriesSchema, listIndexSchema } from './catalog-index';
import { deleteIndexEntriesServer, listIndexServer } from './catalog-index.server';
import {
  createBookServer,
  deleteBookServer,
  deleteEditionServer,
  lookupIsbnServer,
  updateBookServer,
  updateEditionServer,
} from './catalog.server';

// Each handler checks the caller's permission itself: the route guards do not cover these.

export const lookupIsbnFn = createServerFn({ method: 'GET' })
  .validator(lookupIsbnSchema)
  .handler(async ({ data }) =>
    lookupIsbnServer(data.isbn, { googleBooksApiKey: getServerEnv().GOOGLE_BOOKS_API_KEY }),
  );

export const createBookFn = createServerFn({ method: 'POST' })
  .validator(createBookSchema)
  .handler(async ({ data }) => createBookServer(data));

export const updateBookFn = createServerFn({ method: 'POST' })
  .validator(updateBookSchema)
  .handler(async ({ data }) => updateBookServer(data));

export const updateEditionFn = createServerFn({ method: 'POST' })
  .validator(updateEditionSchema)
  .handler(async ({ data }) => updateEditionServer(data));

export const deleteBookFn = createServerFn({ method: 'POST' })
  .validator(bookIdSchema)
  .handler(async ({ data }) => deleteBookServer(data));

export const deleteEditionFn = createServerFn({ method: 'POST' })
  .validator(editionIdSchema)
  .handler(async ({ data }) => deleteEditionServer(data));

export const listBooksFn = createServerFn({ method: 'GET' })
  .validator(listSearchSchema)
  .handler(async ({ data }) => listBooksServer(data));

export const getBookFn = createServerFn({ method: 'GET' })
  .validator(bookIdSchema)
  .handler(async ({ data }) => getBookServer(data.bookId));

export const listIndexFn = createServerFn({ method: 'GET' })
  .validator(listIndexSchema)
  .handler(async ({ data }) => listIndexServer(data));

export const deleteIndexEntriesFn = createServerFn({ method: 'POST' })
  .validator(indexEntriesSchema)
  .handler(async ({ data }) => deleteIndexEntriesServer(data));
