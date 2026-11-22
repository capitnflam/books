import { expect, fn, screen, waitFor } from 'storybook/test';

import { Button } from '#/components/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '#/components/combobox';
import { Field, FieldDescription, FieldError, FieldLabel } from '#/components/field';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FC } from 'react';

const genres = ['fantasy', 'science_fiction', 'mystery', 'poetry', 'short_stories'] as const;
type Genre = (typeof genres)[number];

const labels: Record<Genre, string> = {
  fantasy: 'Fantasy',
  science_fiction: 'Science fiction',
  mystery: 'Mystery',
  poetry: 'Poetry',
  short_stories: 'Short stories',
};

type GenrePickerProps = {
  defaultValue?: Genre[];
  invalid?: boolean;
  onValueChange?: (value: Genre[]) => void;
  /** The picker sits in a form, as it does on a page: Enter must not send it. */
  onSubmit?: () => void;
};

const NO_GENRES: Genre[] = [];

/** Several genres chosen from a list, shown as chips; typing filters the list. */
const GenrePicker: FC<GenrePickerProps> = ({
  defaultValue = NO_GENRES,
  invalid,
  onValueChange,
  onSubmit,
}) => {
  const anchor = useComboboxAnchor();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Field className="w-96" data-invalid={invalid ? true : undefined}>
        <FieldLabel id="story-genres-label" htmlFor="story-genres">
          Genres
        </FieldLabel>
        <Combobox
          multiple
          autoHighlight
          items={genres}
          defaultValue={defaultValue}
          itemToStringLabel={(genre: Genre) => labels[genre]}
          onValueChange={(value) => onValueChange?.(value)}
        >
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(chosen: Genre[]) => (
                <>
                  {chosen.map((genre) => (
                    <ComboboxChip key={genre} removeLabel={`Remove ${labels[genre]}`}>
                      {labels[genre]}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id="story-genres"
                    // Base UI also renders a hidden input, so name this one from the label directly.
                    aria-labelledby="story-genres-label"
                    aria-describedby="story-genres-hint"
                    aria-invalid={invalid ? true : undefined}
                    placeholder={chosen.length === 0 ? 'Find a genre' : undefined}
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No genre matches.</ComboboxEmpty>
            <ComboboxList aria-labelledby="story-genres-label">
              {(genre: Genre) => (
                <ComboboxItem key={genre} value={genre}>
                  {labels[genre]}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription id="story-genres-hint">Choose one or more.</FieldDescription>
        {invalid && <FieldError>Choose at least one genre.</FieldError>}
      </Field>
      <Button type="submit" className="mt-6">
        Save
      </Button>
    </form>
  );
};

const meta: Meta<typeof GenrePicker> = {
  title: 'Components/Combobox',
  component: GenrePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onValueChange: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof GenrePicker>;

export const Multiple: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Genres' });

    await userEvent.click(input);
    await userEvent.keyboard('fan');
    await userEvent.click(await screen.findByRole('option', { name: 'Fantasy' }));

    await expect(args.onValueChange).toHaveBeenLastCalledWith(['fantasy']);
    await expect(canvas.getByRole('button', { name: 'Remove Fantasy' })).toBeVisible();
  },
};

export const EnterChoosesTheMatch: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Genres' });

    await userEvent.click(input);
    await userEvent.keyboard('myst{Enter}');

    await expect(args.onValueChange).toHaveBeenLastCalledWith(['mystery']);

    // Enter with nothing to choose, list open or closed, leaves the form alone too.
    await userEvent.keyboard('zzz{Enter}{Escape}{Enter}');

    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['mystery']);
  },
};

export const WithChosenItems: Story = {
  args: { defaultValue: ['fantasy', 'short_stories'] },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Fantasy' }));

    await expect(args.onValueChange).toHaveBeenLastCalledWith(['short_stories']);
    await waitFor(() =>
      expect(canvas.queryByRole('button', { name: 'Remove Fantasy' })).not.toBeInTheDocument(),
    );
  },
};

export const NoMatch: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Genres' }));
    await userEvent.keyboard('zzz');

    await expect(await screen.findByText('No genre matches.')).toBeVisible();

    // An open list hides the rest of the page from screen readers (Base UI); close it before
    // the accessibility check runs, as a reader would.
    await userEvent.keyboard('{Escape}');
  },
};

export const Invalid: Story = {
  args: { invalid: true },
};
