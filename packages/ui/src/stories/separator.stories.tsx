import { cn } from 'cn';

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
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
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
};
