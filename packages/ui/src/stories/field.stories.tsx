import { expect } from 'storybook/test';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '#/components/field';
import { Input } from '#/components/input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { orientation: 'vertical' },
  argTypes: {
    orientation: {
      options: ['vertical', 'horizontal', 'responsive'],
      control: {
        type: 'radio',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: (args) => (
    <Field {...args} className="w-80">
      <FieldLabel htmlFor="field-story-title">Title</FieldLabel>
      <Input id="field-story-title" placeholder="The Hobbit" />
      <FieldDescription>The title as printed on the cover.</FieldDescription>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group')).toBeInTheDocument();
    await expect(canvas.getByLabelText('Title')).toBeInTheDocument();
  },
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <Field {...args} className="w-96">
      <FieldContent>
        <FieldLabel htmlFor="field-story-pages">Pages</FieldLabel>
        <FieldDescription>Total page count.</FieldDescription>
      </FieldContent>
      <Input id="field-story-pages" type="number" className="w-24" />
    </Field>
  ),
};

export const WithError: Story = {
  name: 'With Error',
  render: (args) => (
    <Field {...args} data-invalid className="w-80">
      <FieldLabel htmlFor="field-story-isbn">ISBN</FieldLabel>
      <Input id="field-story-isbn" aria-invalid defaultValue="123" />
      <FieldError errors={[{ message: 'ISBN must have 10 or 13 digits.' }]} />
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('ISBN must have 10 or 13 digits.');
  },
};

export const WithMultipleErrors: Story = {
  name: 'With Multiple Errors',
  render: (args) => (
    <Field {...args} data-invalid className="w-80">
      <FieldLabel htmlFor="field-story-password">Password</FieldLabel>
      <Input id="field-story-password" type="password" aria-invalid />
      <FieldError
        errors={[
          { message: 'Must be at least 8 characters.' },
          { message: 'Must contain a number.' },
          { message: 'Must contain a number.' },
          undefined,
        ]}
      />
    </Field>
  ),
  play: async ({ canvas }) => {
    // Duplicate messages are merged into a single list item.
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
  },
};

export const Disabled: Story = {
  render: (args) => (
    <Field {...args} data-disabled className="w-80">
      <FieldLabel htmlFor="field-story-disabled">Author</FieldLabel>
      <Input id="field-story-disabled" disabled defaultValue="J. R. R. Tolkien" />
    </Field>
  ),
};

export const Form: Story = {
  render: () => (
    <form className="w-96">
      <FieldSet>
        <FieldLegend>Add a book</FieldLegend>
        <FieldDescription>Details used to find the book in your library.</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="field-story-form-title">Title</FieldLabel>
            <Input id="field-story-form-title" placeholder="The Hobbit" />
          </Field>
          <Field>
            <FieldLabel htmlFor="field-story-form-author">Author</FieldLabel>
            <Input id="field-story-form-author" placeholder="J. R. R. Tolkien" />
          </Field>
          <FieldSeparator>or</FieldSeparator>
          <Field>
            <FieldLabel htmlFor="field-story-form-isbn">ISBN</FieldLabel>
            <Input id="field-story-form-isbn" placeholder="978-0-261-10221-7" />
            <FieldDescription>Fills in the other fields automatically.</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Add a book' })).toBeInTheDocument();
    await expect(canvas.getByText('or')).toBeInTheDocument();
  },
};
