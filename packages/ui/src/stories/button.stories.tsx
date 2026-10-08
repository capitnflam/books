import { IconBook } from '@tabler/icons-react';
import { fn } from 'storybook/test';

import { Button } from '#/components/button';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Button',
  },
};

export const Icon: Story = {
  args: {
    children: <IconBook />,
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
            <th />
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
              <td className="border p-1">{size}</td>
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
            <th />
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
              <td className="border p-1">{size}</td>
              {buttonVariants.map((variant) => (
                <td key={variant} className="border p-1">
                  <Button variant={variant} size={size}>
                    <IconBook />
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
