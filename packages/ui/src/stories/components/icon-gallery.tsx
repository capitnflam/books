import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from 'cn';
import { useMemo, useRef, useState } from 'react';

import { Field, FieldLabel } from '#/components/field';
import { Icon, iconNameList } from '#/components/icon';
import { IconButton } from '#/components/icon-button';
import { Input } from '#/components/input';
import { Label } from '#/components/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/tooltip';

import type { IconName } from '#/components/icon';
import type { FC } from 'react';

const IconItem: FC<{ iconName: IconName }> = ({ iconName }) => {
  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        render={
          <div
            className={cn(
              'flex items-center justify-center rounded border shadow',
              'h-20 max-h-20 min-h-20 w-20 max-w-20 min-w-20',
            )}
            onClick={() => {
              navigator.clipboard.writeText(iconName);
            }}
          >
            <Icon icon={iconName} />
          </div>
        }
      />
      <TooltipContent>{iconName}</TooltipContent>
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
            variant="secondary"
            onClick={() => {
              setSearchFilter('');
            }}
          />
        </div>
      </Field>
      <div className="flex flex-row items-center gap-1">
        <Label htmlFor="total-icons">Total:</Label>
        <span id="total-icons">{filteredIconNames.length}</span>
      </div>
      <div ref={parentRef} className="h-96 w-full overflow-auto border">
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
