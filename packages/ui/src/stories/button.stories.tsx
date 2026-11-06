import { fn } from 'storybook/test';

import { Button } from '#/components/button';
import { Icon } from '#/components/icon';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn(), variant: 'default', size: 'default' },
  argTypes: {
    variant: {
      control: {
        type: 'radio',
      },
    },
    size: {
      control: {
        type: 'radio',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const IconButton: Story = {
  args: {
    'aria-label': 'Book',
    children: <Icon icon="book" aria-hidden />,
    size: 'icon',
  },
};

const buttonVariants: React.ComponentProps<typeof Button>['variant'][] = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
];
const buttonSizes: React.ComponentProps<typeof Button>['size'][] = ['lg', 'default', 'sm', 'xs'];
const iconButtonSizes: React.ComponentProps<typeof Button>['size'][] = [
  'icon-lg',
  'icon',
  'icon-sm',
  'icon-xs',
];

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
          {buttonSizes.map((size) => (
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
};
