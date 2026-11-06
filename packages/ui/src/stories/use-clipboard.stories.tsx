import { useState } from 'react';
import { expect, spyOn } from 'storybook/test';

import { Button } from '#/components/button';
import { Field, FieldLabel } from '#/components/field';
import { Input } from '#/components/input';
import { useClipboard } from '#/hooks/use-clipboard';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FC } from 'react';

const ClipboardDemo: FC = () => {
  const clipboard = useClipboard();
  const [text, setText] = useState('The Hobbit');
  const [status, setStatus] = useState('');

  return (
    <div className="flex w-80 flex-col gap-2">
      <Field>
        <FieldLabel htmlFor="clipboard-text">Text</FieldLabel>
        <Input id="clipboard-text" value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <Button
          onClick={async () => {
            try {
              await clipboard.copy(text);
              setStatus(`Copied "${text}"`);
            } catch {
              setStatus('Copy failed');
            }
          }}
        >
          Copy
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              setText(await clipboard.paste());
              setStatus('Pasted');
            } catch {
              setStatus('Paste failed');
            }
          }}
        >
          Paste
        </Button>
      </div>
      <p role="status" className="text-sm">
        {status}
      </p>
    </div>
  );
};

const meta: Meta<typeof ClipboardDemo> = {
  title: 'Hooks/useClipboard',
  component: ClipboardDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ClipboardDemo>;

export const Default: Story = {
  beforeEach: () => {
    // Clipboard access needs permissions the test browser doesn't grant; mock it.
    spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    spyOn(navigator.clipboard, 'readText').mockResolvedValue('Dune');
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith('The Hobbit');
    await expect(canvas.getByRole('status')).toHaveTextContent('Copied "The Hobbit"');

    await userEvent.click(canvas.getByRole('button', { name: 'Paste' }));
    await expect(canvas.getByLabelText('Text')).toHaveValue('Dune');
    await expect(canvas.getByRole('status')).toHaveTextContent('Pasted');
  },
};

export const Denied: Story = {
  beforeEach: () => {
    spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Permission denied'));
    spyOn(navigator.clipboard, 'readText').mockRejectedValue(new Error('Permission denied'));
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Copy failed');

    await userEvent.click(canvas.getByRole('button', { name: 'Paste' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Paste failed');
    await expect(canvas.getByLabelText('Text')).toHaveValue('The Hobbit');
  },
};
