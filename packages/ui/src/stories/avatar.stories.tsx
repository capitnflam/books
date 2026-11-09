import { expect } from 'storybook/test';

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '#/components/avatar';

import type { AvatarProps } from '#/components/avatar';
import type { Meta, StoryObj } from '@storybook/react-vite';

// A 1×1 burgundy pixel, so the story needs no network access.
const portrait =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOoUlP7DwAD1QHEHSQXlAAAAABJRU5ErkJggg==';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { size: 'default' },
  argTypes: {
    size: {
      options: ['sm', 'default', 'lg'],
      control: { type: 'radio' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>EH</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('EH')).toBeVisible();
  },
};

export const WithImage: Story = {
  name: 'With Image',
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={portrait} alt="Éloïse Hugo" />
      <AvatarFallback>EH</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvas }) => {
    // The fallback shows until the image has loaded, then gives way to it.
    await expect(await canvas.findByRole('img', { name: 'Éloïse Hugo' })).toBeVisible();
    await expect(canvas.queryByText('EH')).not.toBeInTheDocument();
  },
};

const sizes: NonNullable<AvatarProps['size']>[] = ['sm', 'default', 'lg'];

export const AllSizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div className="flex items-center gap-4">
      {sizes.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>EH</AvatarFallback>
          <AvatarBadge />
        </Avatar>
      ))}
    </div>
  ),
};

export const Group: Story = {
  render: (args) => (
    <AvatarGroup>
      {/* Typical initials; very wide pairs such as "MW" nearly fill a 32px avatar on their own. */}
      {['EH', 'JT', 'LC'].map((initials) => (
        <Avatar key={initials} size={args.size}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
  play: async ({ canvas }) => {
    // Every set of initials must stay clear of the next avatar, which is drawn over it.
    const avatars = canvas.getAllByText(/^[A-Z]{2}$/u);

    for (const [index, initials] of avatars.slice(0, -1).entries()) {
      const range = document.createRange();
      range.selectNodeContents(initials);
      const textRight = range.getBoundingClientRect().right;
      const nextLeft = avatars[index + 1]!.getBoundingClientRect().left;

      await expect(textRight).toBeLessThanOrEqual(nextLeft);
    }
  },
};

export const SmallGroup: Story = {
  ...Group,
  name: 'Small Group',
  args: { size: 'sm' },
};

export const LargeGroup: Story = {
  ...Group,
  name: 'Large Group',
  args: { size: 'lg' },
};
