import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  tags: ['-lintignore'],
  // Standalone Go binary used by lint-staged, not an npm package.
  ignoreBinaries: ['actionlint'],
  workspaces: {
    '.': {},
  },
};

export default config;
