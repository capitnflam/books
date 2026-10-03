import { cva } from 'class-variance-authority';
import { cn } from 'cn';

import type { ButtonHTMLAttributes, FC } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const buttonVariants = cva<{
  variant: Record<ButtonVariant, string>;
  size: Record<ButtonSize, string>;
}>('bg-brand-500 rounded px-4 py-2 text-black', {
  variants: {
    variant: {
      primary: 'bg-brand-500 text-black',
      secondary: 'bg-brand-50 text-black',
      ghost: 'bg-transparent text-black',
      destructive: 'bg-red-500 text-white',
    },
    size: {
      small: 'px-2 py-1 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className,
  ...props
}) => {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
};
