import { Flex, Container } from '@lawallet/ui'

import { FooterCart } from './style'

interface ComponentProps {
  children: any
}

export default function Component(props: ComponentProps) {
  const { children } = props

  return (
    <FooterCart>
      <Container size="small">
        <Flex flex={1} align="center">
          {children}
        </Flex>
      </Container>
    </FooterCart>
  )
}
