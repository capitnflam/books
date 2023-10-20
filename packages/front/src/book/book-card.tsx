import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react'

interface Props {
  readonly className?: string
  readonly header: React.ReactNode
  readonly children: React.ReactNode
}

export function BookCard({
  className = 'h-full w-full',
  header,
  children,
}: Props) {
  return (
    <Card className={className}>
      <CardHeader>{header}</CardHeader>
      <Divider />
      <CardBody>{children}</CardBody>
    </Card>
  )
}
