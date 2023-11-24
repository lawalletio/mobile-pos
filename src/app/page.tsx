'use client'

// React/Next
import Link from 'next/link'

// Components
import { Flex, Heading, Text, Divider, Icon, Card } from '@/components/UI'
import Container from '@/components/Layout/Container'
import {
  PantheonIcon,
  SharedWalletIcon,
  CartIcon,
  MinerIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'

export default function Page() {
  return (
    <>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          <Heading as="h4">Selecciona un modo (v0.0.8)</Heading>
          <Flex gap={8}>
            <Card>Under construction</Card>
          </Flex>
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}
