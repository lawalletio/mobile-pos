'use client'

import { fontPrimary } from '@/styles/fonts'

import { HeadingBox, HeadingCustom } from './style'

interface HeadingProps {
  children: any
  as?: string
  align?: 'left' | 'center' | 'right'
  color?: string
}

export default function Heading(props: HeadingProps) {
  const { children, as = 'h1', align = 'left', color } = props

  return (
    <HeadingBox className={fontPrimary.className}>
      <HeadingCustom as={as} $align={align} $color={color}>
        {children}
      </HeadingCustom>
    </HeadingBox>
  )
}
