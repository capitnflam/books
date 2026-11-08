import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { cn } from 'cn';

import type { FC } from 'react';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

export type ButtonProps = ButtonPrimitive.Props & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const buttonVariants = cva<{
  variant: Record<ButtonVariant, string>;
  size: Record<ButtonSize, string>;
}>(
  "group/button focus-visible:ring-ring focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding font-serif font-medium tracking-[0.01em] whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-invalid:ring-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
  {
    variants: {
      variant: {
        default:
          'bg-primary border-primary text-primary-foreground shadow-page hover:bg-[color-mix(in_srgb,var(--primary)_85%,var(--foreground))]',
        outline:
          'border-input text-foreground hover:bg-card hover:border-foreground aria-expanded:bg-card aria-expanded:border-foreground',
        secondary:
          'bg-card border-secondary-foreground text-secondary-foreground hover:bg-secondary aria-expanded:bg-secondary',
        ghost: 'text-foreground hover:bg-muted aria-expanded:bg-muted',
        destructive:
          'border-destructive text-destructive hover:bg-alert-soft aria-expanded:bg-alert-soft',
        link: 'text-link underline-offset-3 hover:underline',
      },
      size: {
        default:
          'h-11 gap-2 px-5 text-base/6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        xs: "h-6 gap-1 rounded-sm px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        lg: 'h-12 gap-2 px-6 text-base/6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5',
        icon: 'size-11',
        'icon-xs': "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': "size-8 [&_svg:not([class*='size-'])]:size-4",
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export const Button: FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  ...props
}) => {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
};
