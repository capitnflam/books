# CLAUDE.md

## Repository

pnpm + Turborepo monorepo (workspaces in `apps/*` and `packages/*`).

| Package                    | Path                         | Contents                                                                        |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| `webapp`                   | `apps/webapp`                | TanStack Start app (React, TanStack Router + Query), Clerk auth, Paraglide i18n |
| `@books/database`          | `packages/database`          | Drizzle ORM schema, client, migrations and seed scripts for PostgreSQL          |
| `@books/ui`                | `packages/ui`                | Shared React components (shadcn, Base UI, Tailwind CSS 4), hooks and Storybook  |
| `@books/shared`            | `packages/shared`            | Framework-free TypeScript types and utilities                                   |
| `@books/typescript-config` | `packages/typescript-config` | Shared `tsconfig` presets (`base.json`, `react.json`)                           |

`webapp` depends on `database` and `ui`; `ui` depends on `shared`.

### Tooling

- Use pnpm (version pinned in `packageManager`), never npm or yarn. Node version is pinned in `engines.node`.
- Lint with oxlint and format with oxfmt; there is no ESLint or Prettier. knip reports unused files, exports and dependencies.
- Run scripts from the root (`pnpm <script>`, which goes through turbo) or for one package with `pnpm --filter <package-name> run <script>`.

### Imports

- Between packages, import by workspace name: `@books/database`, `@books/shared`, and `@books/ui/components/<name>`, `@books/ui/hooks/<name>`, `@books/ui/lib/<name>` (see `exports` in `packages/ui/package.json`). Never import another package's files by relative path.
- Within a package, use the `#/*` alias for `src/*` rather than long relative paths.
- `packages/ui/components.json` configures the shadcn CLI for adding components to `ui`.

### UI components (shadcn)

shadcn copies component source into `packages/ui/src/components/`; the repo owns that code. It uses the `base-mira` style, built on Base UI (compose with the `render` prop, not Radix's `asChild`).

- Add a component with `pnpm dlx shadcn@latest add <name>` from `packages/ui`, then adapt it to the repo's conventions (`FC`, exported `<Name>Props` type, `cva` + `cn`, `data-slot`), apply the Ex Libris theme to it (see below) and add its story in the same PR.
- Edit shadcn components in place. Don't create wrappers whose only job is to restyle or rename another component.
- Make a change at the lowest level that covers it:
  1. a design token (CSS variable in `src/styles/globals.css`, light and dark) when the change applies everywhere;
  2. the component's `cva` variants or base classes when it applies to one component;
  3. the component's markup or behaviour only when its structure must change.
- A component that combines others behind a new API (like `IconButton` over `Button`) goes in its own file with its own story. It builds on the base component and never copies its classes.
- To pull an upstream shadcn fix into a component that already exists, generate it somewhere temporary, compare, and copy over what you want. Never re-run `add` with overwrite on a component that has been customized.
- Keep edits to copied components small and leave the rest of the file as it is, so later comparisons with upstream stay readable.

### Ex Libris theme

The UI follows the Ex Libris design system: a classic reading room, with cream paper, burgundy leather, banker's-lamp green and serif type. Its source of truth is the **Ex Libris** design system artifact (https://claude.ai/artifact/G33dPDSkoivf3UKbPmUhRM): read its `project/README.md`, `project/tokens.json` and `project/components/<Name>/README.md` for a component's rules. Its tokens are implemented in `packages/ui/src/styles/globals.css`: the Day (light) palette on `:root`, Lamp (dark) on `.dark`, the shadcn roles mapped onto them, the Garamond fonts, radii, `shadow-page` and the text styles.

Every component you add with shadcn, or update from upstream, gets the theme before it is merged; upstream's `base-mira` defaults are not finished styling.

- Colours come only from tokens: the shadcn roles (`bg-primary`, `text-muted-foreground`, `border-input`…) or the Ex Libris colours (`bg-vellum`, `text-forest`, `border-rule`…). No hard-coded colours or Tailwind palette colours (`gray-*`, `red-*`).
- Follow the system's roles: `burgundy` (`primary`) for the main action, links and active state, with one primary action per screen; `forest` (`secondary`) for success and secondary actions; `alert` (`destructive`) for errors, always with an icon; `gilt` only for ornaments, never text; `rule` for decorative dividers and `ink-muted` (`input`) for control borders.
- Radii: `rounded-sm` (2px) for badges and labels, `rounded-md` (4px) for buttons, inputs and cards, `rounded-lg` (8px) for dialogs and panels. No pills; `rounded-full` only for things that are round by nature (radio dots, avatars).
- Type: UI text is at least `text-sm`, because Garamond is hard to read at upstream's `text-xs/relaxed`. Use `text-xs` only for the `xs` size. Headings use `font-heading`.
- Controls: 44px tall by default (`h-11`) and 32px for `sm` (`h-8`). Show keyboard focus as `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`, at full strength (no `ring-ring/30`).
- Raised surfaces (menus, popovers, cards) use `bg-popover` or `bg-card` (vellum) with `shadow-page`, not grey shadows.
- Inside `cn()`, don't combine a custom text style (`text-ui`, `text-body`, `text-heading-*`…) with a text colour: `cn` reads the style as a colour and drops the real one. Use a built-in size (`text-base/6` for `ui`) instead.
- When an upstream update conflicts with themed classes, keep the theme's colours, sizes and type, and take upstream's structural or behavioural changes.
- The component's story runs axe in light and dark, so contrast on its tokens must pass in both.

### Translations

`webapp` uses Paraglide: messages live in `apps/webapp/messages/`, with `en` as the base locale and `de` and `fr` as the others (`apps/webapp/project.inlang/settings.json`).

- A new or renamed message goes into every locale's file in the same change, with the same key.
- To add a locale, add it to `locales` in `settings.json` and create `messages/<locale>.json` with every key from `en.json`. The locale switcher, the `/<locale>/...` URLs and `<html lang>` all read the list from the settings, so no code changes are needed.
- In `fr.json`, put a non-breaking space (U+00A0) before `:`, `;`, `?` and `!`, as French typography requires.

## Testing

- `packages/ui`: every story in `src/stories/` runs as a test in headless Chromium (Storybook Vitest addon). A new component needs a story; use `play` functions to test interactions. Run one file with `pnpm --filter @books/ui exec vitest run src/stories/button.stories.tsx`.
- `packages/ui` stories are also checked with axe (`a11y.test: 'error'` in `packages/ui/.storybook/preview.tsx`), so an accessibility violation fails the test. Each story runs twice, as the `storybook-light` and `storybook-dark` vitest projects (`packages/ui/vite.config.ts`), so contrast is checked in both themes. Give icon-only buttons an accessible name (`IconButton` requires `label`) and don't lower the setting to get a story to pass.
- `packages/shared`, `packages/database` and `apps/webapp`: Vitest (`shared` also runs type tests with `--typecheck`). Run one file with `pnpm --filter <package-name> exec vitest run <path>`.
- `pnpm test` from the root runs every package's tests.

## Local setup

### Environment variables

Env files are gitignored; never commit secrets or real values.

- `apps/webapp/.env.local`: copy `apps/webapp/.env.example` and fill in `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` and `DATABASE_URL` (validated in `apps/webapp/src/config/env.ts`).
- `packages/database/.env.local` (or `.env`): `DATABASE_URL`, a PostgreSQL connection string. `drizzle.config.ts` loads it for the `drizzle-kit` commands.
- `db:seed` and `db:reset` run through `tsx` and do not load env files: export `DATABASE_URL` in the shell before running them.

### Database

The schema lives in `packages/database/src/db/schema.ts` (Drizzle ORM, PostgreSQL); migrations live in `packages/database/drizzle/`.

- Fresh database: `pnpm db:migrate`, then `pnpm db:seed` for sample data. The seed creates the built-in roles from `packages/database/src/db/roles.ts` (`reader`, the default; `moderator`; `admin`, with every permission); export `ADMIN_AUTHENTICATION_ID` (a Clerk user ID) to give `admin` to that user, since the first admin can't be granted from the app.
- Access control: users get permissions only through roles (`roles` → `role_permissions`, assigned by `user_roles`). Permissions are the fixed list in `packages/database/src/db/permissions.ts`; code checks permissions, never role names. A new user gets the role marked `is_default` (at most one) at first sign-in. A new permission goes into `admin` in `roles.ts` automatically, and into any other built-in role that should have it. Feature flags are granted per user (`user_feature_flags`) or to everyone (`feature_flags.enabled_for_all`).
- Schema change: edit `schema.ts`, run `pnpm db:generate` to create a new migration, review the generated SQL, then `pnpm db:migrate`. Commit the migration together with the schema change.
- [`packages/database/ERD.md`](packages/database/ERD.md) is a Mermaid ER diagram generated from `schema.ts` (`pnpm db:erd`). The pre-commit hook regenerates and stages it when `schema.ts` is committed, and a test in `packages/database` fails when it is stale.
- `pnpm db:push` syncs the schema without a migration; use it only for throwaway local experiments.
- `pnpm db:reset` wipes every table. Never run it, or `db:push`, against a shared or production database.

## Files not to edit by hand

- `pnpm-lock.yaml`: change dependencies with `pnpm add` / `pnpm remove` / `pnpm update`. Root dependencies are pinned to exact versions; keep new ones exact too.
- `apps/webapp/src/routeTree.gen.ts`: generated by TanStack Router from `src/routes/` (`pnpm --filter webapp generate-routes`, which runs the Start Vite plugin; the bare `tsr generate` CLI drops the Start `Register` declaration).
- `apps/webapp/src/paraglide/`: generated from `apps/webapp/messages/` (`pnpm --filter webapp paraglide:compile`); edit the message files instead.
- `packages/database/drizzle/`: migrations that are already committed may have been applied somewhere; never edit or delete them. Generate a new migration instead.
- `packages/database/ERD.md`: generated from the schema (`pnpm db:erd`).
- `dist/` folders: build output.

## Validating a change

A change is valid when every check the CI workflow (`.github/workflows/ci.yml`) runs passes. Run them from the repo root, in this order:

```bash
pnpm format:check   # oxfmt formatting (fix with pnpm format:fix)
pnpm lint:check     # oxlint (fix with pnpm lint:fix)
pnpm knip           # unused files, exports and dependencies
pnpm type:check     # TypeScript, per package via turbo
pnpm test           # tests, per package via turbo
pnpm build          # production build of every package
```

- Run `pnpm install --frozen-lockfile` first on a fresh checkout or after dependency changes.
- The Storybook tests in `packages/ui` run in headless Chromium; install it once with `pnpm --filter @books/ui exec playwright install chromium`.
- To check a single package, filter it: `pnpm --filter <package-name> run type:check` (or `test`, `build`).
- The `pre-commit` hook runs lint-staged (lint fix, format fix and type check on staged files, `actionlint` on workflow files), but it is not a substitute for the full list above.

## Git commits

Every commit message must follow [Conventional Commits](https://www.conventionalcommits.org/). A `commit-msg` hook runs commitlint (`@commitlint/config-conventional`) and rejects anything else.

- Format: `<type>(<optional scope>): <description>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Scope: the affected app or package when relevant, e.g. `feat(web): ...`
- Description: imperative mood, lowercase start, no trailing period, header ≤ 100 chars
- Body (optional): blank line after the header, explain what and why
- Breaking changes: `!` after the type/scope and a `BREAKING CHANGE:` footer
- Never use placeholder messages like `wip`

## Branches and pull requests

`master` is protected: changes land only through a pull request, merged by squash (the only merge method allowed), with linear history and no force pushes or deletion. The CI `Checks` job must pass and the branch must be up to date with `master` before merging. Merged branches are deleted automatically.

- Branch from up-to-date `master` and name the branch `<type>/<short-kebab-description>`, using the Conventional Commit types above, e.g. `feat/book-search`, `fix/login-redirect`, `docs/claude-md`.
- The PR title becomes the squashed commit on `master`, so it must follow the Conventional Commits rules above (commitlint does not check it).
- Keep each PR to one concern; split unrelated refactors, features and fixes into separate PRs.
- Ship related pieces together in the same PR:
  - a schema change with its generated migration;
  - a new or changed `ui` component with its story;
  - an update to this file when the PR changes tooling, scripts or conventions.
- Inside a PR, split the work into meaningful commits that a reviewer can read one at a time, even though the PR is squashed on merge. Each commit is one logical step (e.g. a dependency bump, a refactor it needs, then the feature, then its translations) with its own Conventional Commit message, and leaves the code in a working state. Don't lump unrelated changes into one commit or leave fix-up commits like `fix lint` or `address review`: fold those into the commit they correct (`git commit --fixup` then `git rebase --autosquash`) before asking for review. Once a review has started, add new commits instead of rewriting the ones already reviewed.
- The PR description says what changed, why, and anything a reviewer should check.
- Merge only when CI is green, the branch is up to date with `master`, and all review threads are resolved (all enforced by the ruleset). Never bypass a failing check.
