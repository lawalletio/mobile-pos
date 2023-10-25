'use client'

import { Icon } from './style'

interface ComponentProps {
  children: any
  size?: 'small' | 'normal'
  color?: string
}

export default function Component(props: ComponentProps) {
  const { children, size = 'normal', color = 'currentColor' } = props

  const isSmall = size === 'small'

  return (
    <Icon $isSmall={isSmall} $color={color}>
      {children}
    </Icon>
  )
}
