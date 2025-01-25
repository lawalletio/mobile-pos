'use client'

// React/Next
import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// Hooks
import { LaWalletContext } from '@/context/LaWalletContext'

// Utils
import { fetchLNURL } from '@/lib/utils'

// Components
import { Flex, Heading, Text, Divider, Icon, Card } from '@/components/UI'
import Container from '@/components/Layout/Container'
import {
  PantheonIcon,
  SharedWalletIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'
import { BtnLoader } from '@/components/Loader/Loader'

export default function Page() {
  const { setDestinationLUD06 } = useContext(LaWalletContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  // Hooks
  const { destination } = useParams()

  const handleSetDestination = useCallback(
    async (_destination: string) => {
      setIsLoading(true)
      try {
        const lud06 = await fetchLNURL(_destination)
        console.dir(lud06)
        setDestinationLUD06(lud06)
      } catch (e) {
        alert((e as Error).message)
      } finally {
        setIsLoading(false)
      }
    },
    [setDestinationLUD06]
  )

  useEffect(() => {
    if (!destination) {
      return
    }
    handleSetDestination(decodeURIComponent(destination as string))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination])

  return (
    <>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          {isLoading ? (
            <BtnLoader />
          ) : (
            <>
              <Heading as="h4">
                {decodeURIComponent(destination as string)}
              </Heading>
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
                      <Heading as="h5">Transferencia</Heading>
                      <Text size="small">
                        Transferi dinero de una tarjeta a otra.
                      </Text>
                    </Flex>
                  </Link>
                </Card>
              </Flex>
            </>
          )}
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}
