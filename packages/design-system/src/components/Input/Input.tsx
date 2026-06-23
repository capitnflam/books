import * as React from 'react'

import styles from './Input.module.scss'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
}

export const Input: React.FC<InputProps> = ({
  children,
  label,
  error = false,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.inputContainer} ${error ? styles.error : ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.inputField} ${className}`} {...props} />
      {error && <p className={styles.errorMessage}>This field is required.</p>}
    </div>
  )
}
