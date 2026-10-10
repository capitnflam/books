import { useCallback, useMemo } from 'react';

export const useClipboard = () => {
  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);
  const paste = useCallback(async () => {
    return await navigator.clipboard.readText();
  }, []);

  const clipboard = useMemo(() => ({ copy, paste }), [copy, paste]);

  return clipboard;
};
