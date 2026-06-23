import styles from './Typography.module.scss'

import type { ComponentProps, ElementType } from 'react'

type TypographyProps<E extends ElementType = 'span'> = {
  as: E
} & {
  [K in keyof ComponentProps<E>]: ComponentProps<E>[K]
}

// type TypographyProps<E extends ElementType> = Omit<ComponentProps<E>, 'as'> & { as?: E }

export function Typography<E extends ElementType>({ as: As, ...props }: TypographyProps<E>) {
  const Component = As ?? 'span'

  return <Component {...props} />
}
