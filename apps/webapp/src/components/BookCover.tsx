import { useState } from 'react';

import type { FC, ReactNode } from 'react';

type BookCoverProps = {
  url: string | null;
  /** Empty when the title is written beside the cover. */
  alt: string;
  /** Its size, and where it sits. */
  className?: string;
  /** Shown when `url` is not a web address, or fails to load. */
  fallback?: ReactNode;
};

/** A picture of a book's cover. */
const BookCover: FC<BookCoverProps> = ({
  url,
  alt,
  className = 'h-48 w-auto',
  fallback = null,
}) => {
  // The address that failed to load: a new one may load.
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

  if (!url || !/^https?:\/\/\S+$/u.test(url) || brokenUrl === url) {
    return fallback;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`shadow-page rounded-sm object-contain ${className}`}
      onError={() => setBrokenUrl(url)}
    />
  );
};

export default BookCover;
