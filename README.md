# books

A web app for a shared catalogue of books.

- **Catalogue**: browse and search books, and see their editions, authors, series, genres and subjects. Those who look after it edit and delete its books and editions, and delete its authors, series, publishers and subjects from the catalogue index.
- **Adding books and editions**: fill in a book, or another edition of one, from its ISBN, looked up in Open Library, the national libraries of France (BnF) and Japan (NDL) for their own ISBNs, and Google Books when an API key is set.
- **Administration**: manage users and their roles, and grant feature flags to users. What a user can see and do depends on the permissions of their role.
- **Languages and themes**: English, German and French; light, dark or the device's preference.

## Repository

A [pnpm](https://pnpm.io) and [Turborepo](https://turborepo.dev) monorepo:

| Package                    | Path                                                       | Contents                                                                                                              |
| -------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `webapp`                   | [`apps/webapp`](apps/webapp)                               | [TanStack Start](https://tanstack.com/start) app, with [Clerk](https://clerk.com) for sign-in and Paraglide for i18n  |
| `@books/database`          | [`packages/database`](packages/database)                   | [Drizzle ORM](https://orm.drizzle.team) schema, client, migrations and seed for PostgreSQL                            |
| `@books/ui`                | [`packages/ui`](packages/ui)                               | React components ([shadcn](https://ui.shadcn.com), [Base UI](https://base-ui.com), Tailwind CSS), hooks and Storybook |
| `@books/shared`            | [`packages/shared`](packages/shared)                       | Framework-free TypeScript types and utilities                                                                         |
| `@books/typescript-config` | [`packages/typescript-config`](packages/typescript-config) | Shared `tsconfig` presets                                                                                             |

The database schema is drawn in [`packages/database/ERD.md`](packages/database/ERD.md).

## Getting started

You need:

- Node.js and pnpm, in the versions pinned by `engines.node` and `packageManager` in [`package.json`](package.json);
- PostgreSQL 13 or later, with the `pg_trgm` extension available (it is part of PostgreSQL's contrib modules);
- a Clerk application, created in the [Clerk dashboard](https://dashboard.clerk.com).

### 1. Install the dependencies

```bash
pnpm install
```

### 2. Create the database

```sql
CREATE USER booksserver WITH ENCRYPTED PASSWORD 'bookspassword';
CREATE DATABASE books;
GRANT ALL ON DATABASE books TO booksserver;
```

### 3. Set the environment variables

The env files are gitignored. Copy `apps/webapp/.env.example` to `apps/webapp/.env.local`, then set:

| Variable                     | Required | Value                                      |
| ---------------------------- | -------- | ------------------------------------------ |
| `VITE_CLERK_PUBLISHABLE_KEY` | yes      | Publishable key of the Clerk application   |
| `CLERK_SECRET_KEY`           | yes      | Secret key of the Clerk application        |
| `DATABASE_URL`               | yes      | PostgreSQL connection string               |
| `GOOGLE_BOOKS_API_KEY`       | no       | Lets the ISBN lookup also ask Google Books |

The database commands read `DATABASE_URL` from `packages/database/.env.local`, so put it there too:

```bash
DATABASE_URL=postgresql://booksserver:bookspassword@localhost:5432/books
```

### 4. Fill the database

```bash
pnpm db:migrate
pnpm db:seed
```

The seed creates the built-in roles (`reader`, `moderator` and `admin`), sample books and sample users.

New users get the `reader` role when they first sign in. The first admin can't be chosen from the app: set `ADMIN_AUTHENTICATION_ID` to a Clerk user ID (`user_…`) in `packages/database/.env.local` and run `pnpm db:seed` again. It is safe to run more than once.

### 5. Start the app

```bash
pnpm dev
```

The app runs on <http://localhost:3000>.

## Scripts

Run them from the root:

| Script                                 | What it does                                                         |
| -------------------------------------- | -------------------------------------------------------------------- |
| `pnpm dev`                             | Starts the app and rebuilds the packages as they change              |
| `pnpm storybook`                       | Starts Storybook for `@books/ui` on <http://localhost:6006>          |
| `pnpm build`                           | Builds for production                                                |
| `pnpm test`                            | Runs the tests                                                       |
| `pnpm type:check`                      | Checks the types                                                     |
| `pnpm lint:check`, `pnpm lint:fix`     | Checks or fixes the code with oxlint                                 |
| `pnpm format:check`, `pnpm format:fix` | Checks or fixes the formatting with oxfmt                            |
| `pnpm knip`                            | Reports unused files, exports and dependencies                       |
| `pnpm db:generate`                     | Creates a migration from the changes to the schema                   |
| `pnpm db:migrate`                      | Applies the migrations                                               |
| `pnpm db:seed`                         | Adds the built-in roles and the sample data                          |
| `pnpm db:studio`                       | Opens Drizzle Studio                                                 |
| `pnpm db:erd`                          | Regenerates the diagram of the schema                                |
| `pnpm db:reset`                        | Empties every table; never run it on a shared or production database |

To run a script of one package, filter it: `pnpm --filter <package-name> run <script>`.

Some tests of `webapp` and `@books/ui` run in headless Chromium. Install it once:

```bash
pnpm --filter @books/ui exec playwright install chromium
```

## UI components

Components live in `packages/ui/src/components/` and are imported by package name:

```tsx
import { Button } from '@books/ui/components/button';
```

To add one from shadcn, run the CLI from `packages/ui`:

```bash
pnpm dlx shadcn@latest add <name>
```

Then give it the app's Ex Libris theme and a story, as described in [`CLAUDE.md`](CLAUDE.md#ui-components-shadcn).

## Contributing

`master` changes only through pull requests, which need the CI checks to pass: `format:check`, `lint:check`, `knip`, `type:check`, `test` and `build`. Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/).

[`CLAUDE.md`](CLAUDE.md) holds the project's conventions: code, UI, forms, translations, tests, migrations, commits and pull requests.

## License

[Beerware](LICENSE)
