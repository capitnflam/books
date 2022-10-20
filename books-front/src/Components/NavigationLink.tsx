import { Tooltip, UnstyledButton, createStyles } from '@mantine/core'
import { TablerIcon } from '@tabler/icons'
import { useLocation, useNavigate } from '@tanstack/react-location'

const useStyles = createStyles((theme) => ({
  link: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  active: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({
        variant: 'light',
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
        .color,
    },
  },
}))

interface NavigationLinkProps {
  icon: TablerIcon
  label: string
  path: string
}

export const NavigationLink = ({
  icon: Icon,
  label,
  path,
}: NavigationLinkProps) => {
  const {
    current: { pathname },
  } = useLocation()
  const navigate = useNavigate()
  const { classes, cx } = useStyles()
  return (
    <Tooltip label={label} position="right" transitionDuration={0}>
      <UnstyledButton
        onClick={() => {
          navigate({ to: path })
        }}
        className={cx(classes.link, { [classes.active]: path === pathname })}
      >
        <Icon stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  )
}
