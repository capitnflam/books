import { expect } from 'storybook/test';

import { useIsMobile } from '#/hooks/use-mobile';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FC } from 'react';

const MobileDemo: FC = () => {
  const isMobile = useIsMobile();

  return <p role="status">{isMobile ? 'Mobile layout' : 'Desktop layout'}</p>;
};

const meta: Meta<typeof MobileDemo> = {
  title: 'Hooks/useIsMobile',
  component: MobileDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MobileDemo>;

export const Desktop: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Desktop layout');
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Mobile layout')).toBeVisible();
  },
};
