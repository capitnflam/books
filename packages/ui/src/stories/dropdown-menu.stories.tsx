import { useState } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import { Button } from '#/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '#/components/dropdown-menu';
import { Icon } from '#/components/icon';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FC } from 'react';

type DropdownMenuStoryArgs = { onBorrow: () => void; onDelete: () => void };

const BookMenu: FC<DropdownMenuStoryArgs> = ({ onBorrow, onDelete }) => {
  const [showCovers, setShowCovers] = useState(true);
  const [sort, setSort] = useState('title');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Actions
        <Icon icon="chevron-down" data-icon="inline-end" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>The Hobbit</DropdownMenuLabel>
          <DropdownMenuItem onClick={onBorrow}>
            <Icon icon="book" aria-hidden />
            Borrow
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icon icon="share" aria-hidden />
              Share
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>By email</DropdownMenuItem>
              <DropdownMenuItem>Copy the link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showCovers} onCheckedChange={setShowCovers}>
          Show covers
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="author">Author</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Icon icon="trash" aria-hidden />
          Delete the record
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const meta: Meta<DropdownMenuStoryArgs> = {
  title: 'Components/DropdownMenu',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onBorrow: fn(), onDelete: fn() },
  render: (args) => (
    <div className="p-16">
      <BookMenu {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<DropdownMenuStoryArgs>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // The menu is portalled to the document body, outside the story canvas.
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(body.getByRole('menu')).toBeVisible());
    await expect(body.getByRole('menuitemcheckbox', { name: 'Show covers' })).toBeChecked();
    await expect(body.getByRole('menuitemradio', { name: 'Title' })).toBeChecked();

    await userEvent.click(body.getByRole('menuitem', { name: /Borrow/u }));
    await expect(args.onBorrow).toHaveBeenCalledOnce();
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const KeyboardNavigation: Story = {
  name: 'Keyboard Navigation',
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Actions' });

    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(body.getByRole('menu')).toBeVisible());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Open: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(body.getByRole('menu')).toBeVisible());
    // Leave it open, with the destructive item highlighted, so axe checks its contrast.
    body.getByRole('menuitem', { name: 'Delete the record' }).focus();
  },
};
