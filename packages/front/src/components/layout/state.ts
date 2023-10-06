import { useCallback } from 'react'
import { atom, useSetRecoilState } from 'recoil'

export const sidebarOpenState = atom({
  key: 'IsSidebarOpen',
  default: true,
})

export const useToggleSidebarOpen = () => {
  const setSidebarOpenState = useSetRecoilState(sidebarOpenState)
  const toggle = useCallback(() => {
    setSidebarOpenState((current) => !current)
  }, [setSidebarOpenState])

  return toggle
}
