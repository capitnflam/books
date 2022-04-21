import {
  ColorScheme,
  MantineProvider,
  ColorSchemeProvider,
} from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'

export const Provider = ({ children }: { children?: React.ReactNode }) => {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'color-scheme',
    defaultValue: 'light',
  })

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={() =>
        setColorScheme((current) => (current === 'dark' ? 'light' : 'dark'))
      }
    >
      <MantineProvider
        theme={{
          colorScheme,
        }}
      >
        {children}
      </MantineProvider>
    </ColorSchemeProvider>
  )
}
