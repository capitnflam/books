import { type ReactNode, useCallback, useState } from 'react'

import { BookEditModal } from './book-edit-modal'

interface Props {
  readonly children: ReactNode
  readonly id: string
}

export function BookEdit({ children, id }: Props) {
  const [open, setOpen] = useState(false)
  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])
  const onClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      <button
        className="appearance-none"
        onClick={handleOpen}
        aria-label="Edit"
      >
        {children}
      </button>
      {open && <BookEditModal isOpen={open} onClose={onClose} id={id} />}
    </>
  )
}
