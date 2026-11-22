import { useState } from 'react';

import { m } from '#/paraglide/messages';

import type { FC } from 'react';

type CoverPreviewProps = { url: string; title: string };

/** The picture at `url`, or nothing when it is not a web address or fails to load. */
const CoverPreview: FC<CoverPreviewProps> = ({ url, title }) => {
  // The address that failed to load: a new one may load.
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

  if (!/^https?:\/\/\S+$/u.test(url) || brokenUrl === url) {
    return null;
  }

  return (
    <img
      src={url}
      alt={title ? m.book_cover_alt({ title }) : ''}
      className="shadow-page h-48 w-auto self-start rounded-sm object-contain"
      onError={() => setBrokenUrl(url)}
    />
  );
};

export default CoverPreview;
