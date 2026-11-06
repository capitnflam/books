import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from 'cn';
import { useMemo, useRef, useState } from 'react';

import { Field, FieldLabel } from '#/components/field';
import { Icon, iconNameList } from '#/components/icon';
import { IconButton } from '#/components/icon-button';
import { Input } from '#/components/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/tooltip';
import { useClipboard } from '#/hooks/use-clipboard';

import type { IconName } from '#/components/icon';
import type { FC } from 'react';

type CopyStatus = 'idle' | 'copied' | 'failed';

const copyStatusText: Record<Exclude<CopyStatus, 'idle'>, string> = {
  copied: 'Copied!',
  failed: 'Copy failed',
};

const IconItem: FC<{ iconName: IconName }> = ({ iconName }) => {
  const clipboard = useClipboard();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  return (
    <Tooltip
      onOpenChange={(open) => {
        if (open) {
          setCopyStatus('idle');
        }
      }}
    >
      <TooltipTrigger
        delay={0}
        closeOnClick={false}
        type="button"
        aria-label={`Copy ${iconName}`}
        className={cn(
          'flex items-center justify-center rounded border shadow',
          'h-20 max-h-20 min-h-20 w-20 max-w-20 min-w-20',
          'focus-visible:ring-ring/50 cursor-pointer outline-none focus-visible:ring-3',
        )}
        onClick={async () => {
          try {
            await clipboard.copy(iconName);
            setCopyStatus('copied');
          } catch {
            setCopyStatus('failed');
          }
        }}
      >
        <Icon icon={iconName} aria-hidden />
      </TooltipTrigger>
      <TooltipContent aria-live="polite">
        {copyStatus === 'idle' ? iconName : copyStatusText[copyStatus]}
      </TooltipContent>
    </Tooltip>
  );
};

const ICONS_PER_ROW = 6;

export const IconGallery: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const filteredIconNames = useMemo(() => {
    return iconNameList.filter((name) => name.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [searchFilter]);
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: Math.ceil(filteredIconNames.length / ICONS_PER_ROW),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    gap: 2,
  });

  return (
    <div className="flex w-lg flex-col gap-1">
      <Field>
        <FieldLabel htmlFor="search-input">Search</FieldLabel>
        <div className="space-between flex flex-row items-center gap-1">
          <Input
            id="search-input"
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
            }}
            placeholder="search filter"
          />
          <IconButton
            icon="x"
            label="Clear search"
            variant="secondary"
            onClick={() => {
              setSearchFilter('');
            }}
          />
        </div>
      </Field>
      <p role="status" className="text-sm">
        <span className="font-medium">Total:</span> {filteredIconNames.length}
      </p>
      {/* Focusable so keyboard users can scroll the list. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div
        ref={parentRef}
        role="region"
        aria-label="Icons"
        tabIndex={0}
        className="focus-visible:ring-ring/50 h-96 w-full overflow-auto border outline-none focus-visible:ring-3"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
          className="relative flex w-full flex-col"
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * ICONS_PER_ROW;
            const endIndex = Math.min(startIndex + ICONS_PER_ROW, filteredIconNames.length);
            const rowIcons = filteredIconNames.slice(startIndex, endIndex);

            return (
              <div
                key={virtualRow.key}
                className={cn(
                  'flex w-full flex-row flex-nowrap justify-start gap-0.5',
                  'absolute top-0 left-0',
                )}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {rowIcons.map((iconName) => (
                  <IconItem key={iconName} iconName={iconName} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
