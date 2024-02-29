'use client'

import { useRouter } from 'next/navigation'
import { CaretLeftIcon } from '@bitcoin-design/bitcoin-icons-react/filled'
import { Container, Flex, Icon } from '@lawallet/ui'

import { Navbar, BackButton } from './style'
import { ReactNode } from 'react'

interface ComponentProps {
  children?: ReactNode
  showBackPage?: boolean
}

export default function Component(props: ComponentProps) {
  const { children, showBackPage = false } = props

  const router = useRouter()

  return (
    <Navbar>
      <Container>
        <Flex flex={1} align="center" gap={8}>
          {showBackPage && (
            <BackButton onClick={() => router.back()}>
              <Icon>
                <CaretLeftIcon />
              </Icon>
            </BackButton>
          )}
          {children}
        </Flex>
      </Container>
    </Navbar>
  )
}
