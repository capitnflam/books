import { useCallback, useMemo } from 'react';

type Clipboard = {
  /** Writes `text` to the clipboard. Rejects when the browser denies clipboard access. */
  copy: (text: string) => Promise<void>;
  /** Reads text from the clipboard. Rejects when the browser denies clipboard access. */
  paste: () => Promise<string>;
};

export const useClipboard = (): Clipboard => {
  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);
  const paste = useCallback(async () => {
    return await navigator.clipboard.readText();
  }, []);

  return useMemo(() => ({ copy, paste }), [copy, paste]);
};
