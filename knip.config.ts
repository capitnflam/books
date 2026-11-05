import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  tags: ['-lintignore'],
  // Standalone Go binary used by lint-staged, not an npm package.
  ignoreBinaries: ['actionlint'],
  // Third-party agent skills installed via `skills add`, tracked by skills-lock.json.
  ignore: ['.claude/skills/**'],
  workspaces: {
    '.': {},
  },
};

export default config;
