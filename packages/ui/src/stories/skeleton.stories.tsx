import { expect } from 'storybook/test';

import { Skeleton } from '#/components/skeleton';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: { className: 'h-4 w-48' },
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('[data-slot=skeleton]');

    await expect(skeleton).toBeInTheDocument();
    await expect(skeleton).toHaveClass('animate-pulse');
  },
};

export const BookCard: Story = {
  name: 'Book Card',
  render: () => (
    <div className="bg-card shadow-page flex w-80 gap-4 rounded-md p-4">
      <Skeleton className="h-24 w-16 rounded-sm" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  ),
};
