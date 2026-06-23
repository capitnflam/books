import * as React from 'react'

import styles from './Checkbox.module.scss'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({ children, label, className, ...props }) => {
  return (
    <div className={`${styles.checkboxContainer} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type="checkbox"
        id={props.id || 'design-system-checkbox'}
        className={styles.checkboxInput}
        {...props}
      />
    </div>
  )
}
