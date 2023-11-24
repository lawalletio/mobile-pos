'use client'

// React/Next
import Link from 'next/link'

// Hooks
import { useParams } from 'next/navigation'

// Components
import { Flex, Heading, Text, Divider, Icon, Card } from '@/components/UI'
import Container from '@/components/Layout/Container'
import {
  PantheonIcon,
  SharedWalletIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'

export default function Page() {
  // Hooks
  const { destination } = useParams()
  return (
    <>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          <Heading as="h4">{destination}@lawallet.ar</Heading>

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
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}
