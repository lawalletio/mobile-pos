'use client'

import { RefreshIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

import { Flex, LinkButton } from '@/components/UI'
import Container from '../Container'

import { Navbar } from './style'

interface ComponentProps {
  children?: any
  theme?: 'primary' | 'secondary'
}

export default function Component(props: ComponentProps) {
  const { children, theme = 'primary' } = props

  return (
    <Navbar $theme={theme}>
      <Container>
        <Flex flex={1} align="center" gap={8}>
          <Flex align="end" gap={8}>
            {children}
          </Flex>
          <LinkButton
            href={theme === 'primary' ? '/tree' : '/'}
            variant="bezeledGray"
            size="small"
            color={theme}
          >
            <RefreshIcon />
          </LinkButton>
        </Flex>
      </Container>
    </Navbar>
  )
}
