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
          <Heading as="h4">Selecciona un modo:</Heading>
          <Flex gap={8}>
            <Card>
              <Link href="/cart/pizza">
                <Icon>
                  <CartIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Pizza</Heading>
                  <Text size="small">Pizza Store</Text>
                </Flex>
              </Link>
            </Card>
            <Card>
              <Link href="/cart/green">
                <Icon>
                  <CartIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Urban Store</Heading>
                  <Text size="small">Urbano</Text>
                </Flex>
              </Link>
            </Card>
          </Flex>

          <Flex gap={8}>
            <Card>
              <Link href="/cart/coffee">
                <Icon>
                  <CartIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Cafe</Heading>
                  <Text size="small">Coffee Store</Text>
                </Flex>
              </Link>
            </Card>
            <Card>
              <Link href="/cart/green">
                <Icon>
                  <CartIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Green Shop</Heading>
                  <Text size="small">Shop Green</Text>
                </Flex>
              </Link>
            </Card>
          </Flex>

          <Flex gap={8}>
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
          </Flex>

          <Flex gap={8}>
            <Card color="error">
              <Link href="/admin">
                <Icon>
                  <MinerIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Admin</Heading>
                  <Text size="small">Admin de tarjetas.</Text>
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
