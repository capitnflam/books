import { Button } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { useState } from 'react';

import ErrorMessage from '#/components/ErrorMessage';

import type { FC } from 'react';

type DeleteSectionProps = {
  id: string;
  title: string;
  /** The heading's level: 3 inside another section. */
  level?: 2 | 3;
  /** What goes away, and what stays. */
  description: string;
  /** The button that asks for confirmation. */
  label: string;
  /** The question, naming what would be deleted. */
  question: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Why the last attempt failed, unless the page says it elsewhere. */
  error?: string | false;
  pending: boolean;
  /** Nothing to delete yet. */
  disabled?: boolean;
  /** Whether it was deleted: the question is then put away. */
  onDelete: () => Promise<boolean>;
};

/** The place to delete something for good, after a confirmation. */
const DeleteSection: FC<DeleteSectionProps> = ({
  id,
  title,
  level = 2,
  description,
  label,
  question,
  confirmLabel,
  cancelLabel,
  error,
  pending,
  disabled = false,
  onDelete,
}) => {
  const [confirming, setConfirming] = useState(false);
  const Heading = `h${level}` as const;
  const questionId = `${id}-confirm`;

  const handleDelete = async () => {
    if (await onDelete()) {
      setConfirming(false);
    }
  };

  return (
    <section
      aria-labelledby={id}
      className="border-destructive flex flex-col gap-4 rounded-md border px-5 py-4"
    >
      <div className="flex flex-col gap-1">
        <Heading id={id} className="text-heading-3 text-destructive flex items-center gap-2">
          <Icon icon="alert-triangle" aria-hidden className="size-5 shrink-0" />
          {title}
        </Heading>
        <p className="text-muted-foreground text-base/6">{description}</p>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {confirming ? (
        <div className="flex flex-col gap-3">
          <p className="text-base/6 font-semibold break-words" id={questionId}>
            {question}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="destructive"
              aria-describedby={questionId}
              disabled={pending || disabled}
              onClick={() => void handleDelete()}
            >
              <Icon icon="trash" aria-hidden data-icon="inline-start" />
              {confirmLabel}
            </Button>
            <Button variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
              {cancelLabel}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="destructive"
          className="self-start"
          disabled={disabled}
          onClick={() => setConfirming(true)}
        >
          <Icon icon="trash" aria-hidden data-icon="inline-start" />
          {label}
        </Button>
      )}
    </section>
  );
};

export default DeleteSection;
