import { expect, fn } from 'storybook/test';

import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '#/components/native-select';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof NativeSelect> = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    'aria-label': 'Format',
    onChange: fn(),
    className: 'w-64',
    children: (
      <>
        <NativeSelectOption value="">Not specified</NativeSelectOption>
        <NativeSelectOption value="hardcover">Hardcover</NativeSelectOption>
        <NativeSelectOption value="paperback">Paperback</NativeSelectOption>
        <NativeSelectOption value="ebook">E-book</NativeSelectOption>
      </>
    ),
  },
  argTypes: {
    size: { options: ['default', 'sm'], control: { type: 'select' } },
    disabled: { control: { type: 'boolean' } },
  },
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Format' });

    await userEvent.selectOptions(select, 'paperback');
    await expect(select).toHaveValue('paperback');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Format' })).toBeDisabled();
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true },
};

export const WithGroups: Story = {
  args: {
    'aria-label': 'Language',
    children: (
      <>
        <NativeSelectOptGroup label="Germanic">
          <NativeSelectOption value="en">English</NativeSelectOption>
          <NativeSelectOption value="de">German</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Romance">
          <NativeSelectOption value="fr">French</NativeSelectOption>
          <NativeSelectOption value="es">Spanish</NativeSelectOption>
        </NativeSelectOptGroup>
      </>
    ),
  },
};
