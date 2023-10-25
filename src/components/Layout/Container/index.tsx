'use client'

import { ContainerCustom } from './style'

interface ContainerProps {
  children: any
  size?: 'small' | 'medium'
}

export default function Container(props: ContainerProps) {
  const { children, size = 'medium' } = props

  return (
    <ContainerCustom $isSmall={size === 'small'}>{children}</ContainerCustom>
  )
}
