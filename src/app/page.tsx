'use client'

import Link from 'next/link'
import {
  PantheonIcon,
  SharedWalletIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'

import { Flex, Heading, Text, Divider, Icon, Card } from '@/components/UI'
import Container from '@/components/Layout/Container'

export default function Page() {
  return (
    <>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          <Heading as="h4">Selecciona un modo:</Heading>
          <Flex gap={8}>
            <Card color="secondary">
              <Link href="/tree">
                <Icon>
                  <SharedWalletIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Arbolito</Heading>
                  <Text size="small">
                    Transferi dinero de una tarjeta a otra.
                  </Text>
                </Flex>
              </Link>
            </Card>
            <Card>
              <Link href="/paydesk">
                <Icon>
                  <PantheonIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Caja</Heading>
                  <Text size="small">Medio de cobro para tu negocio.</Text>
                </Flex>
              </Link>
            </Card>
          </Flex>
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}
