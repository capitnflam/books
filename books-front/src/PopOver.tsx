import {
  FloatingFocusManager,
  FloatingPortal,
  Placement,
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react-dom-interactions'
import { ReactNode, cloneElement, useMemo, useRef, useState } from 'react'
import { mergeRefs } from 'react-merge-refs'

import { useTheme } from './useTheme'

interface Props {
  render: (data: { closeAndDo: (toDo: () => void) => () => void }) => ReactNode
  placement?: Placement
  children: JSX.Element
}

export const PopOver = ({ children, render, placement }: Props) => {
  const [open, setOpen] = useState(false)
  const arrowRef = useRef(null)
  const { className } = useTheme()

  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift(), arrow({ element: arrowRef })],
    placement,
    whileElementsMounted: autoUpdate,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useRole(context),
    useDismiss(context),
  ])

  // Preserve the consumer's ref
  const ref = useMemo(
    () => mergeRefs([reference, (children as any).ref]),
    [reference, children],
  )

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref, ...children.props }))}
      <FloatingPortal>
        {open && (
          <FloatingFocusManager context={context}>
            <div
              className={`${className}`}
              ref={floating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
              }}
              {...getFloatingProps()}
            >
              {render({
                closeAndDo: (toDo) => () => {
                  setOpen(false)
                  toDo()
                },
              })}
              <div ref={arrowRef} className="bg-white" />
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  )
}
