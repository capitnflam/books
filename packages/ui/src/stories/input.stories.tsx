import { expect, fn } from 'storybook/test';

import { Input } from '#/components/input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    'aria-label': 'Title',
    placeholder: 'The Hobbit',
    onChange: fn(),
    className: 'w-64',
  },
  argTypes: {
    type: {
      options: ['text', 'email', 'password', 'number', 'search', 'file'],
      control: {
        type: 'select',
      },
    },
    disabled: {
      control: {
        type: 'boolean',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Title' });

    await userEvent.type(input, 'Dune');
    await expect(input).toHaveValue('Dune');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Title' });

    await expect(input).toBeDisabled();
    await userEvent.type(input, 'Dune');
    await expect(input).toHaveValue('');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'not-an-isbn' },
};

export const File: Story = {
  args: { type: 'file', 'aria-label': 'Cover', placeholder: undefined },
};
