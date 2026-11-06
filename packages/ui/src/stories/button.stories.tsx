import { expect, fn } from 'storybook/test';

import { Button } from '#/components/button';
import { Icon } from '#/components/icon';

import { buttonIconSizes, buttonTextSizes, buttonVariants } from './components/button-options';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn(), variant: 'default', size: 'default', children: 'Button' },
  argTypes: {
    variant: {
      options: buttonVariants,
      control: {
        type: 'radio',
      },
    },
    size: {
      options: [...buttonTextSizes, ...buttonIconSizes],
      control: {
        type: 'radio',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Button' });

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveFocus();
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Button' });

    await expect(button).toBeDisabled();
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, variant: 'outline' },
};

export const IconOnly: Story = {
  name: 'Icon Only',
  args: {
    'aria-label': 'Book',
    children: <Icon icon="book" aria-hidden />,
    size: 'icon',
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Book' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const AllTextButtons: Story = {
  name: 'All Text Buttons',
  render: () => {
    return (
      <table className="border">
        <thead className="border">
          <tr>
            <th className="border p-1">
              <span className="sr-only">Size</span>
            </th>
            {buttonVariants.map((variant) => (
              <th key={variant} className="border p-1">
                {variant}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buttonTextSizes.map((size) => (
            <tr key={size}>
              <th scope="row" className="border p-1">
                {size}
              </th>
              {buttonVariants.map((variant) => (
                <td key={variant} className="border p-1">
                  <Button variant={variant} size={size}>
                    Button
                  </Button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(
      buttonVariants.length * buttonTextSizes.length,
    );
  },
};

export const AllIconButtons: Story = {
  name: 'All Icon Buttons',
  render: () => {
    return (
      <table className="border">
        <thead className="border">
          <tr>
            <th className="border p-1">
              <span className="sr-only">Size</span>
            </th>
            {buttonVariants.map((variant) => (
              <th key={variant} className="border p-1">
                {variant}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buttonIconSizes.map((size) => (
            <tr key={size}>
              <th scope="row" className="border p-1">
                {size}
              </th>
              {buttonVariants.map((variant) => (
                <td key={variant} className="border p-1">
                  <Button variant={variant} size={size} aria-label="Book">
                    <Icon icon="book" aria-hidden />
                  </Button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button', { name: 'Book' })).toHaveLength(
      buttonVariants.length * buttonIconSizes.length,
    );
  },
};
