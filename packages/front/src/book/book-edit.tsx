import { type ReactNode, useCallback, useState } from 'react'

import { BookEditModal } from './book-edit-modal'

interface Props {
  children: ReactNode
  id: string
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
      <button className="appearance-none" onClick={handleOpen}>
        {children}
      </button>
      <BookEditModal isOpen={open} onClose={onClose} id={id} />
    </>
  )
}
