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
  MinerIcon,
  StarIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'

export default function Page() {
  return (
    <>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          <Heading as="h4">Selecciona un modo (v0.0.7)</Heading>
          <Flex gap={8}>
            <Card>
              <Link href="/cart/barra">
                <Icon>
                  <CartIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Barra</Heading>
                  <Text size="small">Barra</Text>
                </Flex>
              </Link>
            </Card>
            <Card>
              <Link href="/cart/comida">
                <Icon>
                  <CartIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Comida</Heading>
                  <Text size="small">Comida</Text>
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
            <Card>
              <Link href="/cart/barra_voluntarios">
                <Icon>
                  <CartIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Barra (Voluntarios)</Heading>
                  <Text size="small">Voluntarios</Text>
                </Flex>
              </Link>
            </Card>

            <Card>
              <Link href="/cart/merch">
                <Icon>
                  <CartIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Merch</Heading>
                  <Text size="small">Merchandising</Text>
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

            <Card color="error">
              <Link href="/extract">
                <Icon>
                  <MinerIcon />
                </Icon>
                <Flex direction="column" gap={4}>
                  <Heading as="h5">Extract</Heading>
                  <Text size="small">Extract.</Text>
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
