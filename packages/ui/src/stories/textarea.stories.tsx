import { expect, fn } from 'storybook/test';

import { Field, FieldDescription, FieldLabel } from '#/components/field';
import { Textarea } from '#/components/textarea';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    'aria-label': 'Description',
    placeholder: 'In a hole in the ground there lived a hobbit.',
    onChange: fn(),
    className: 'w-80',
  },
  argTypes: {
    disabled: { control: { type: 'boolean' } },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Description' });

    await userEvent.type(textarea, 'A hobbit goes on an adventure.');
    await expect(textarea).toHaveValue('A hobbit goes on an adventure.');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Description' })).toBeDisabled();
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Too long' },
};

export const InField: Story = {
  args: { 'aria-label': undefined },
  render: (args) => (
    <Field className="w-80">
      <FieldLabel htmlFor="book-description">Description</FieldLabel>
      <Textarea id="book-description" aria-describedby="book-description-hint" {...args} />
      <FieldDescription id="book-description-hint">
        The blurb, as printed on the back cover.
      </FieldDescription>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Description' })).toHaveAccessibleDescription(
      'The blurb, as printed on the back cover.',
    );
  },
};
