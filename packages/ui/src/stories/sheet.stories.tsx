import { expect, waitFor, within } from 'storybook/test';

import { Button } from '#/components/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/sheet';

import type { SheetContentProps } from '#/components/sheet';
import type { Meta, StoryObj } from '@storybook/react-vite';

type SheetStoryArgs = Pick<SheetContentProps, 'side' | 'showCloseButton'>;

const meta: Meta<SheetStoryArgs> = {
  title: 'Components/Sheet',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { side: 'right', showCloseButton: true },
  argTypes: {
    side: {
      options: ['top', 'right', 'bottom', 'left'],
      control: { type: 'radio' },
    },
  },
  render: (args) => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open the record</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>The Hobbit</SheetTitle>
          <SheetDescription>J. R. R. Tolkien, 1937.</SheetDescription>
        </SheetHeader>
        <p className="px-6">This book is available on shelf 823.912 TOL.</p>
        <SheetFooter>
          <Button>Borrow this book</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export default meta;
type Story = StoryObj<SheetStoryArgs>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    // The sheet is portalled to the document body, outside the story canvas.
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Open the record' }));
    const dialog = await body.findByRole('dialog', { name: 'The Hobbit' });
    await waitFor(() => expect(dialog).toBeVisible());

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const Left: Story = {
  args: { side: 'left', showCloseButton: false },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Open the record' }));
    const dialog = await body.findByRole('dialog', { name: 'The Hobbit' });
    await expect(dialog).toHaveAttribute('data-side', 'left');
    await expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};
