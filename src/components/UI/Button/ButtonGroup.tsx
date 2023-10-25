'use client'

import { ButtonGroup } from './style'

interface ComponentProps {
  children: any
}

export default function Component(props: ComponentProps) {
  const { children } = props

  return <ButtonGroup>{children}</ButtonGroup>
}
