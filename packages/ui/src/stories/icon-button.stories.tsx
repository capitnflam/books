import { fn } from 'storybook/test';

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

export const Default: Story = {};

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
};
