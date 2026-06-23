import * as React from 'react'

import styles from './Button.module.scss'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'small' | 'medium' | 'large'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className,
  ...props
}) => {
  const variantClass = styles[variant]
  const sizeClass = styles[size]

  return (
    <button className={`${styles.base} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  )
}
