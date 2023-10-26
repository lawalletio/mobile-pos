'use client'

import { styled } from 'styled-components'

import theme from '@/styles/theme'

interface NavbarProps {
  $theme: 'primary' | 'secondary'
}

export const Navbar = styled.div<NavbarProps>`
  height: 60px;

  background-color: ${props => theme.colors[props.$theme]};

  color: ${theme.colors.black};
`
