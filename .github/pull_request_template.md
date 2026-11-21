<!--
The PR title becomes the squashed commit on master, so it must follow
Conventional Commits: <type>(<optional scope>): <description>
e.g. feat(webapp): add book search
-->

## What

<!-- What changed, in a few sentences or bullets. -->

## Why

<!-- The problem this solves or the reason for the change. Link related issues (Closes #123). -->

## How to review

<!-- Anything a reviewer should look at closely: risky areas, trade-offs, things you're unsure of, how to try it out. Add screenshots for UI changes (light and dark). -->

## Checklist

- [ ] The PR covers one concern, and its commits are meaningful steps with Conventional Commit messages (no fix-up commits)
- [ ] The CI checks pass locally (`pnpm format:check`, `lint:check`, `knip`, `type:check`, `test`, `build`)
- [ ] Tests or stories cover the change

<!-- Delete the items below that don't apply. -->

- [ ] Schema change: the generated migration is committed with it, and its SQL is reviewed
- [ ] UI component: it has a story, uses the Ex Libris theme (tokens only, no palette colours), and passes axe in light and dark
- [ ] Translations: new or renamed messages are in every locale (`en`, `de`, `fr`)
- [ ] Tooling, scripts or conventions: `CLAUDE.md` is updated
