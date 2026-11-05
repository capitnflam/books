# CLAUDE.md

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
