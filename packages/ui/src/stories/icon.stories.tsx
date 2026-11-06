import { expect, spyOn, waitFor, within } from 'storybook/test';

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
  args: { icon: 'book' },
  argTypes: {
    icon: {
      options: iconNameList,
      control: {
        type: 'select',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('svg.tabler-icon-book')).toBeInTheDocument();
  },
};

export const Icons: Story = {
  render: () => <IconGallery />,
  beforeEach: () => {
    // Clipboard access needs permissions the test browser doesn't grant; mock it.
    spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  },
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const search = canvas.getByLabelText('Search');
    const total = `Total: ${iconNameList.length}`;
    const status = canvas.getByRole('status');

    await step('filter the list', async () => {
      await expect(status).toHaveTextContent(total);
      await userEvent.type(search, 'book2');
      // Filtering thousands of icons can take a moment in the dev build, so wait for it.
      await expect(await canvas.findByRole('button', { name: 'Copy book2' })).toBeInTheDocument();
      await expect(canvas.queryByRole('button', { name: 'Copy a-b' })).not.toBeInTheDocument();
    });

    await step('copy an icon name', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy book2' }));
      await expect(navigator.clipboard.writeText).toHaveBeenCalledWith('book2');
      await waitFor(() => expect(body.getByText('Copied!')).toBeInTheDocument());
    });

    await step('clear the search', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
      await expect(search).toHaveValue('');
      await waitFor(() => expect(status).toHaveTextContent(total));
    });
  },
};

export const IconsCopyFailure: Story = {
  name: 'Icons (Copy Failure)',
  render: () => <IconGallery />,
  beforeEach: () => {
    spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Permission denied'));
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.type(canvas.getByLabelText('Search'), 'book2');
    await userEvent.click(await canvas.findByRole('button', { name: 'Copy book2' }));
    await waitFor(() => expect(body.getByText('Copy failed')).toBeInTheDocument());
  },
};
