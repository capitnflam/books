import { expect, fn } from 'storybook/test';

import { Checkbox } from '#/components/checkbox';
import { Field, FieldContent, FieldDescription, FieldLabel } from '#/components/field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    'aria-label': 'Available for loan',
    onCheckedChange: fn(),
  },
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    indeterminate: { control: { type: 'boolean' } },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Available for loan' });

    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  },
};

export const Checked: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox')).toBeChecked();
  },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, 'aria-label': 'Select every book' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    await expect(checkbox).toHaveStyle({ opacity: '0.5' });
    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true },
};

export const WithLabel: Story = {
  args: { 'aria-label': undefined },
  render: (args) => (
    <Field orientation="horizontal" className="w-80">
      <Checkbox {...args} id="checkbox-story-reference" />
      <FieldContent>
        <FieldLabel htmlFor="checkbox-story-reference">Reference only</FieldLabel>
        <FieldDescription>Readers consult it in the reading room.</FieldDescription>
      </FieldContent>
    </Field>
  ),
  play: async ({ canvas, userEvent }) => {
    // Base UI puts the `id` on its hidden input; it names the visible control by pointing
    // `aria-labelledby` at that input's label, so `htmlFor` is all a caller needs.
    const checkbox = canvas.getByRole('checkbox', { name: 'Reference only' });
    const label = canvas.getByText('Reference only');

    await expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
    await expect(checkbox).toHaveAttribute('aria-labelledby', label.id);
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(label);
    await expect(checkbox).toBeChecked();
    await userEvent.click(label);
    await expect(checkbox).not.toBeChecked();
  },
};
