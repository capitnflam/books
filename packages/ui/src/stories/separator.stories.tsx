import { cn } from 'cn';
import { expect } from 'storybook/test';

import { Separator } from '#/components/separator';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Separator> = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { orientation: 'horizontal' },
  argTypes: {
    orientation: {
      options: ['horizontal', 'vertical'],
      control: {
        type: 'radio',
      },
    },
  },
  render: (args) => (
    <div
      className={cn('flex items-center justify-center', {
        'h-10 w-40': args.orientation === 'horizontal',
        'h-40 w-10': args.orientation === 'vertical',
      })}
    >
      <Separator {...args} />
    </div>
  ),
  play: async ({ args, canvas }) => {
    const separator = canvas.getByRole('separator');
    const { width, height } = separator.getBoundingClientRect();

    await expect(separator).toHaveAttribute('aria-orientation', args.orientation);
    // A horizontal line is 1px tall; a vertical one is 1px wide.
    await expect(args.orientation === 'vertical' ? width : height).toBe(1);
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};
