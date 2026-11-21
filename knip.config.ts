import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  tags: ['-lintignore'],
  // Standalone Go binary used by lint-staged, not an npm package.
  ignoreBinaries: ['actionlint'],
  // Third-party agent skills installed via `skills add`, tracked by skills-lock.json.
  ignore: ['**/.claude/skills/**'],
  // `database` and `shared` declare the `#/*` alias every package has, though their files don't use it yet.
  ignoreIssues: {
    'packages/database/package.json': ['subpaths'],
    'packages/shared/package.json': ['subpaths'],
  },
  workspaces: {
    '.': {},
  },
};

export default config;
