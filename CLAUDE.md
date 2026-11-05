# CLAUDE.md

## Git commits

Every commit message must follow [Conventional Commits](https://www.conventionalcommits.org/). A `commit-msg` hook runs commitlint (`@commitlint/config-conventional`) and rejects anything else.

- Format: `<type>(<optional scope>): <description>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Scope: the affected app or package when relevant, e.g. `feat(web): ...`
- Description: imperative mood, lowercase start, no trailing period, header ≤ 100 chars
- Body (optional): blank line after the header, explain what and why
- Breaking changes: `!` after the type/scope and a `BREAKING CHANGE:` footer
- Never use placeholder messages like `wip`
