import { fn } from 'storybook/test';

import { iconNameList } from '#/components/icon';
import { IconButton } from '#/components/icon-button';

import type { Meta, StoryObj } from '@storybook/react-vite';

const buttonVariants: React.ComponentProps<typeof IconButton>['variant'][] = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
];
const iconButtonSizes: React.ComponentProps<typeof IconButton>['size'][] = [
  'lg',
  'default',
  'sm',
  'xs',
];

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn(), variant: 'default', size: 'default' },
  argTypes: {
    variant: {
      options: buttonVariants.filter((v) => v !== undefined),
      defaultValue: 'default',
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
  args: {
    icon: 'book',
    label: 'Book',
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
                  <IconButton variant={variant} size={size} icon="book" label="Book" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};
