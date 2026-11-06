import { expect } from 'storybook/test';

import { Input } from '#/components/input';
import { Label } from '#/components/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { children: 'Label' },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const WithInput: Story = {
  name: 'With Input',
  render: (args) => (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="label-story-title" {...args} />
      <Input id="label-story-title" placeholder="The Hobbit" />
    </div>
  ),
  args: { children: 'Title' },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('Title');

    await userEvent.click(canvas.getByText('Title'));
    await expect(input).toHaveFocus();
  },
};
