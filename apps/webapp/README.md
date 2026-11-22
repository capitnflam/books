# webapp

The books web app: [TanStack Start](https://tanstack.com/start) (React, TanStack Router, Query and Form), [Clerk](https://clerk.com) for sign-in and [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) for translations.

To set it up (dependencies, environment variables and database), follow the [root README](../../README.md#getting-started). `pnpm dev` from the root then starts it on <http://localhost:3000>.

## Scripts

Run them from the root with `pnpm --filter webapp run <script>`:

| Script              | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `dev`               | Starts the development server on port 3000            |
| `build`             | Builds for production, into `dist/`                   |
| `preview`           | Serves the production build locally                   |
| `test`              | Runs the tests                                        |
| `type:check`        | Compiles the messages, then checks the types          |
| `generate-routes`   | Regenerates `src/routeTree.gen.ts` from `src/routes/` |
| `paraglide:compile` | Compiles the messages into `src/paraglide/`           |

## Structure

| Path                | Contents                                                                  |
| ------------------- | ------------------------------------------------------------------------- |
| `messages/`         | Translations, one file per locale                                         |
| `src/routes/`       | Pages, as file-based routes; those under `_app/` share the sidebar layout |
| `src/services/`     | Server functions and the logic behind them, by feature                    |
| `src/components/`   | Components of the app; generic form fields are in `form/`                 |
| `src/hooks/`        | React hooks, including `useAppForm` for forms                             |
| `src/integrations/` | Clerk and TanStack Query setup                                            |
| `src/config/env.ts` | Validation of the server's environment variables                          |
| `src/testing/`      | What page tests share                                                     |
| `src/utils/`        | Small helpers                                                             |
| `src/start.ts`      | Request middleware: CSRF protection for server functions, and Clerk       |
| `src/server.ts`     | Server entry, which renders each request in the locale of its URL         |

Shared components, hooks and styles come from `@books/ui`; the database client and schema from `@books/database`.

`src/routeTree.gen.ts` and `src/paraglide/` are generated: don't edit them by hand.

## Server functions

A feature in `src/services/` keeps its server functions in `<feature>.functions.ts` and the code they run in `*.server.ts`. Pages call the server functions, which are named `…Fn`.

## Access

Clerk signs users in; what they can do comes from the permissions of their role, kept in the database.

- A page guards itself in `beforeLoad`: with `checkIsAuthenticatedFn` when it only needs someone signed in, with `checkPermissionFn` when it needs a permission. Visitors are sent to the sign-in page, and users without the permission to the forbidden page.
- Route guards don't protect server functions: the server code checks again, with `requireViewerServer` or `requirePermissionServer` (`src/services/access/access.server.ts`).

## Translations

The locales are English (the base locale), German and French, listed in `project.inlang/settings.json`. English pages have no prefix in their URL; the others start with their locale (`/de/me`, `/fr/me`). The router adds and removes the prefix (`src/router.tsx`), so routes and links are written without it.

## Tests

`*.test.ts` files run in Node (the `node` Vitest project) and `*.test.tsx` files, which test the pages, in headless Chromium (the `pages` project). Page tests open the app with `renderPage` (`src/testing/`), with server functions and Clerk replaced.

Run one file with its path:

```bash
pnpm --filter webapp exec vitest run src/routes/_app/-me.test.tsx
```

The conventions for forms, translations and tests are in [`CLAUDE.md`](../../CLAUDE.md).
