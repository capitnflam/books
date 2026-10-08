import { icons } from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef, useState } from 'react';

import { Field, FieldLabel } from '#/components/field';
import { Icon } from '#/components/icon';
import { IconButton } from '#/components/icon-button';
import { Input } from '#/components/input';
import { Label } from '#/components/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/tooltip';

import type { IconName } from '#/components/icon';
import type { FC } from 'react';

const iconNames = Object.keys(icons) as IconName[];

const IconItem: FC<{ iconName: IconName }> = ({ iconName }) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="flex w-fit flex-col items-center gap-1 rounded border p-1 shadow">
            <Icon icon={iconName} />
          </div>
        }
      />
      <TooltipContent>{iconName}</TooltipContent>
    </Tooltip>
  );
};

// <Tooltip>
//   <TooltipTrigger render={<Button variant="outline">Hover</Button>} />
//   <TooltipContent>
//     <p>Add to library</p>
//   </TooltipContent>
// </Tooltip>

export const IconGallery: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const filteredIconNames = useMemo(() => {
    return iconNames.filter((name) => name.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [searchFilter]);
  const virtualizer = useVirtualizer({
    count: filteredIconNames.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
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
            width: '100%',
            position: 'relative',
          }}
        >
          {iconNames.reduce((acc, item) => {
            if (item.length > acc.length) {
              return item;
            }
            return acc;
          }, '')}
          <IconItem iconName="book" />
        </div>
      </div>
    </div>
  );
};
