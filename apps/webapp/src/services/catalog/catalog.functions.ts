import { createServerFn } from '@tanstack/react-start';

import { getServerEnv } from '#/config/env';

import { createBookSchema, lookupIsbnSchema } from './catalog';
import { createBookServer, lookupIsbnServer } from './catalog.server';

// Each handler checks the caller's permission itself: the route guards do not cover these.

export const lookupIsbnFn = createServerFn({ method: 'GET' })
  .validator(lookupIsbnSchema)
  .handler(async ({ data }) =>
    lookupIsbnServer(data.isbn, { googleBooksApiKey: getServerEnv().GOOGLE_BOOKS_API_KEY }),
  );

export const createBookFn = createServerFn({ method: 'POST' })
  .validator(createBookSchema)
  .handler(async ({ data }) => createBookServer(data));
