import { Card } from './style'

interface ComponentProps {
  children: any
  color?: 'primary' | 'secondary'
}

export default function Component(props: ComponentProps) {
  const { children, color = 'primary' } = props

  return <Card $color={color}>{children}</Card>
}
