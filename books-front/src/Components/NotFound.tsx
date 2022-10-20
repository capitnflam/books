import { Image, Stack, Text } from '@mantine/core'
import { useLocation } from '@tanstack/react-location'

export const NotFound = () => {
  const {
    current: { pathname },
  } = useLocation()

  return (
    <Stack
      sx={{
        flexGrow: 1,
      }}
      align="center"
      justify="center"
    >
      <Text>&apos;{pathname}&apos; not found</Text>
      <Image
        sx={(theme) => ({ maxWidth: theme.breakpoints.xs })}
        alt="404 error"
        src="https://http.cat/404.jpg"
        withPlaceholder
        radius="md"
      />
    </Stack>
  )
}
