'use client';

import { cva } from 'class-variance-authority';
import { cn } from 'cn';
import { useMemo } from 'react';

import { Label } from './label';
import { Separator } from './separator';

import type { VariantProps } from 'class-variance-authority';
import type { FC, ComponentProps, PropsWithChildren } from 'react';

export type FieldSetProps = ComponentProps<'fieldset'>;

export const FieldSet: FC<FieldSetProps> = ({ className, ...props }) => {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        className,
      )}
      {...props}
    />
  );
};

export type FieldLegendProps = ComponentProps<'legend'> & { variant?: 'legend' | 'label' };

export const FieldLegend: FC<FieldLegendProps> = ({ className, variant = 'legend', ...props }) => {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base',
        className,
      )}
      {...props}
    />
  );
};

export type FieldGroupProps = ComponentProps<'div'>;

export const FieldGroup: FC<FieldGroupProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4',
        className,
      )}
      {...props}
    />
  );
};

const fieldVariants = cva('group/field data-[invalid=true]:text-destructive flex w-full gap-2', {
  variants: {
    orientation: {
      vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
      horizontal:
        'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      responsive:
        'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export type FieldProps = ComponentProps<'div'> & VariantProps<typeof fieldVariants>;

export const Field: FC<FieldProps> = ({ className, orientation = 'vertical', ...props }) => {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
};

export type FieldContentProps = ComponentProps<'div'>;

export const FieldContent: FC<FieldContentProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="field-content"
      className={cn('group/field-content flex flex-1 flex-col gap-0.5 leading-snug', className)}
      {...props}
    />
  );
};

export type FieldLabelProps = ComponentProps<typeof Label>;

export const FieldLabel: FC<FieldLabelProps> = ({ className, ...props }) => {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10 flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 *:data-[slot=field]:p-2.5',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        className,
      )}
      {...props}
    />
  );
};

export type FieldTitleProps = ComponentProps<'div'>;

export const FieldTitle: FC<FieldTitleProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  );
};

export type FieldDescriptionProps = ComponentProps<'p'>;

export const FieldDescription: FC<FieldDescriptionProps> = ({ className, ...props }) => {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-muted-foreground text-left text-sm leading-normal font-normal group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5',
        'last:mt-0 nth-last-2:-mt-1',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
};

export type FieldSeparatorProps = PropsWithChildren<ComponentProps<'div'>>;

export const FieldSeparator: FC<FieldSeparatorProps> = ({ children, className, ...props }) => {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2',
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
};

export type FieldErrorProps = ComponentProps<'div'> & {
  errors?: ({ message?: string } | undefined)[];
};

export const FieldError: FC<FieldErrorProps> = ({ className, children, errors, ...props }) => {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

    if (uniqueErrors?.length === 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {/* oxlint-disable-next-line react/no-array-index-key */}
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-destructive text-sm font-normal', className)}
      {...props}
    >
      {content}
    </div>
  );
};
