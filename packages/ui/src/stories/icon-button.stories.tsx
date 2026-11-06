import { expect, fn } from 'storybook/test';

import { iconNameList } from '#/components/icon';
import { IconButton } from '#/components/icon-button';

import { buttonVariants, iconButtonSizes } from './components/button-options';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn(), variant: 'default', size: 'default', icon: 'book', label: 'Book' },
  argTypes: {
    variant: {
      options: buttonVariants,
      control: {
        type: 'radio',
      },
    },
    size: {
      options: iconButtonSizes,
      control: {
        type: 'radio',
      },
    },
    icon: {
      options: iconNameList,
      control: {
        type: 'select',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    // The label is the accessible name; there is no visible text.
    const button = canvas.getByRole('button', { name: 'Book' });

    await expect(button).not.toHaveTextContent(/./u);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Book' })).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
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
          {iconButtonSizes.map((size) => (
            <tr key={size}>
              <th scope="row" className="border p-1">
                {size}
              </th>
              {buttonVariants.map((variant) => (
                <td key={variant} className="border p-1">
                  <IconButton variant={variant} size={size} icon="book" label="Book" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button', { name: 'Book' });

    await expect(buttons).toHaveLength(buttonVariants.length * iconButtonSizes.length);

    // Every size must render a square button.
    for (const button of buttons) {
      const { width, height } = button.getBoundingClientRect();
      await expect(width).toBeCloseTo(height, 0);
    }
  },
};
