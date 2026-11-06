interface ImportMetaEnv {
  /** Theme stories render in during tests; set per vitest project in `vite.config.ts`. */
  readonly STORYBOOK_THEME?: 'light' | 'dark';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {
  const content: string;
  export default content;
}
