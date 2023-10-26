'use client'

import { RefreshIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

import { Flex, Button } from '@/components/UI'
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
          <Button
            onClick={() => null}
            variant="bezeledGray"
            size="small"
            color={theme}
          >
            <RefreshIcon />
          </Button>
        </Flex>
      </Container>
    </Navbar>
  )
}
