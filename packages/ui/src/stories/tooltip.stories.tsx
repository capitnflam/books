import { expect, waitFor, within } from 'storybook/test';

import { Button } from '#/components/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/tooltip';

import type { Meta, StoryObj } from '@storybook/react-vite';

type TooltipStoryArgs = Pick<
  React.ComponentProps<typeof TooltipContent>,
  'side' | 'align' | 'sideOffset'
>;

const meta: Meta<TooltipStoryArgs> = {
  title: 'Components/Tooltip',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { side: 'top', align: 'center', sideOffset: 4 },
  argTypes: {
    side: {
      options: ['top', 'right', 'bottom', 'left'],
      control: {
        type: 'radio',
      },
    },
    align: {
      options: ['start', 'center', 'end'],
      control: {
        type: 'radio',
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="p-16">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<TooltipStoryArgs>;

export const Default: Story = {
  render: (args) => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
      <TooltipContent {...args}>Add to library</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    // The popup is portalled to the document body, outside the story canvas.
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });

    await userEvent.hover(trigger);
    await waitFor(() => expect(body.getByText('Add to library')).toBeVisible());

    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByText('Add to library')).not.toBeInTheDocument());
  },
};

export const OpenOnFocus: Story = {
  name: 'Open On Focus',
  render: (args) => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>Focus me</TooltipTrigger>
      <TooltipContent {...args}>Opens on keyboard focus too</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    // The popup starts its fade-in at opacity 0, so wait for the animation to finish.
    await waitFor(() => expect(body.getByText('Opens on keyboard focus too')).toBeVisible());
  },
};

const sides: TooltipStoryArgs['side'][] = ['top', 'right', 'bottom', 'left'];

export const AllSides: Story = {
  name: 'All Sides',
  render: (args) => (
    <div className="grid grid-cols-2 gap-16">
      {sides.map((side) => (
        <Tooltip key={side} defaultOpen>
          <TooltipTrigger render={<Button variant="outline" />}>{side}</TooltipTrigger>
          <TooltipContent {...args} side={side}>
            Tooltip on {side}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};
