import { Icon, iconNameList } from '#/components/icon';

import { IconGallery } from './components/icon-gallery';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {},
  argTypes: {
    icon: {
      type: {
        name: 'enum',
        value: iconNameList,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Primary: Story = {
  args: {
    icon: 'book',
  },
};

export const Icons: Story = {
  render: () => <IconGallery />,
};
