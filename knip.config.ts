import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  tags: ['-lintignore'],
  // Standalone Go binary used by lint-staged, not an npm package.
  ignoreBinaries: ['actionlint'],
  // Third-party agent skills installed via `skills add`, tracked by skills-lock.json.
  ignore: ['**/.claude/skills/**'],
  // Every package declares the `#/*` alias, but `database` can't use it (its explicit `.ts`
  // import extensions raise TS2877 on non-relative paths) and `shared` doesn't need it yet.
  ignoreIssues: {
    'packages/database/package.json': ['subpaths'],
    'packages/shared/package.json': ['subpaths'],
  },
  workspaces: {
    '.': {},
  },
};

export default config;
