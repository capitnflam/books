import { expect, fn } from 'storybook/test';

import { Button, buttonVariants } from '#/components/button';
import { Icon } from '#/components/icon';

import { buttonIconSizes, buttonTextSizes, buttonVariantNames } from './components/button-options';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn(), variant: 'default', size: 'default', children: 'Button' },
  argTypes: {
    variant: {
      options: buttonVariantNames,
      control: {
        type: 'radio',
      },
    },
    size: {
      options: [...buttonTextSizes, ...buttonIconSizes],
      control: {
        type: 'radio',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Button' });

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveFocus();
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Button' });

    await expect(button).toBeDisabled();
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, variant: 'outline' },
};

export const IconOnly: Story = {
  name: 'Icon Only',
  args: {
    'aria-label': 'Book',
    children: <Icon icon="book" aria-hidden />,
    size: 'icon',
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Book' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const AsLink: Story = {
  name: 'As Link',
  args: { children: 'Open the catalogue' },
  // Not a `<Button render={<a />}>`, which assistive technology would announce as a button.
  render: ({ variant, size, children }) => (
    <a href="#catalogue" className={buttonVariants({ variant, size })}>
      {children}
    </a>
  ),
  play: async ({ canvas, userEvent }) => {
    const link = canvas.getByRole('link', { name: 'Open the catalogue' });
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();

    const opened = fn();
    link.addEventListener('click', (event) => {
      event.preventDefault();
      opened();
    });

    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(opened).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect(opened).toHaveBeenCalledOnce();
  },
};

/** What a button looks like on the page: its box, colours, type and focus ring. */
const look = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  const { width, height } = element.getBoundingClientRect();
  return {
    width,
    height,
    color: style.color,
    background: style.backgroundColor,
    border: style.border,
    radius: style.borderRadius,
    padding: style.padding,
    font: style.font,
    shadowAndRing: style.boxShadow,
    iconWidth: element.querySelector('svg')?.getBoundingClientRect().width,
  };
};

/** A link with the button classes looks the same as the button, in every variant and size. */
export const LinksMatchButtons: Story = {
  name: 'Links Match Buttons',
  render: () => (
    <div className="flex flex-col gap-4">
      {buttonVariantNames.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          {buttonTextSizes.map((size) => (
            <div key={size} className="flex gap-2">
              <Button variant={variant} size={size}>
                <Icon icon="book" aria-hidden data-icon="inline-start" />
                Book
              </Button>
              <a href="#book" className={buttonVariants({ variant, size })}>
                <Icon icon="book" aria-hidden data-icon="inline-start" />
                Book
              </a>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const buttons = canvas.getAllByRole('button', { name: 'Book' });
    const links = canvas.getAllByRole('link', { name: 'Book' });
    await expect(links).toHaveLength(buttons.length);
    await expect(links.map((link) => look(link))).toEqual(buttons.map((button) => look(button)));

    // The first button and the link next to it show the same focus ring.
    const unfocused = links.map((link) => look(link).shadowAndRing)[0];
    await userEvent.tab();
    await expect(buttons[0]).toHaveFocus();
    const focusedButton = buttons.map((button) => look(button))[0];
    await userEvent.tab();
    await expect(links[0]).toHaveFocus();
    const focusedLink = links.map((link) => look(link))[0];
    await expect(focusedLink).toEqual(focusedButton);
    await expect(focusedLink?.shadowAndRing).not.toBe(unfocused);
  },
};

export const AllTextButtons: Story = {
  name: 'All Text Buttons',
  render: () => {
    return (
      <table className="border">
        <thead className="border">
          <tr>
            <th className="border p-1">
              <span className="sr-only">Size</span>
            </th>
            {buttonVariantNames.map((variant) => (
              <th key={variant} className="border p-1">
                {variant}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buttonTextSizes.map((size) => (
            <tr key={size}>
              <th scope="row" className="border p-1">
                {size}
              </th>
              {buttonVariantNames.map((variant) => (
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
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(
      buttonVariantNames.length * buttonTextSizes.length,
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
            <th className="border p-1">
              <span className="sr-only">Size</span>
            </th>
            {buttonVariantNames.map((variant) => (
              <th key={variant} className="border p-1">
                {variant}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buttonIconSizes.map((size) => (
            <tr key={size}>
              <th scope="row" className="border p-1">
                {size}
              </th>
              {buttonVariantNames.map((variant) => (
                <td key={variant} className="border p-1">
                  <Button variant={variant} size={size} aria-label="Book">
                    <Icon icon="book" aria-hidden />
                  </Button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button', { name: 'Book' })).toHaveLength(
      buttonVariantNames.length * buttonIconSizes.length,
    );
  },
};
