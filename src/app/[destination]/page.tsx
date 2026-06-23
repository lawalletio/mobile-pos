'use client'

// React/Next
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// Hooks
import { LaWalletContext } from '@/context/LaWalletContext'
import { useLocalStorage } from 'react-use-storage'
import { useRouter } from 'next/navigation'
import { useLN } from '@/context/LN'
import { useOrder } from '@/context/Order'
import { useNostr } from '@/context/Nostr'

// Utils
import { fetchLNURL, normalizeLNURL } from '@/lib/utils'

// Components
import { Flex, Heading, Text, Divider, Icon, Card } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Top from '../layout/top'
import {
  PantheonIcon,
  InvoiceIcon,
  MenuIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'
import { BtnLoader } from '@/components/Loader/Loader'

const TEST_DESTINATION = 'test@lacrypta.ar'

function getMetadataIdentifier(metadata?: string): string | undefined {
  try {
    const parsed = JSON.parse(metadata ?? '[]') as string[][]
    return parsed.find(([type]) => type === 'text/identifier')?.[1]
  } catch {
    return undefined
  }
}

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [, setStoredDestination] = useLocalStorage('destination', '')
  const [tabEnabled] = useLocalStorage<boolean>('tabEnabled', false)

  // Hooks
  const router = useRouter()
  const { destination } = useParams()
  const { clear } = useLN()
  const { clear: clearOrder } = useOrder()
  const { resolveNip05 } = useNostr()
  const { setDestinationLUD06 } = useContext(LaWalletContext)

  const removeStoredDestination = useCallback(() => {
    setStoredDestination('')
    setDestinationLUD06(null)
    router.replace('/')
  }, [setDestinationLUD06, router, setStoredDestination])

  const handleSetDestination = useCallback(
    async (_destination: string) => {
      try {
        const lud06 = await fetchLNURL(_destination)
        const metadataIdentifier = getMetadataIdentifier(lud06.metadata)
        let resolvedIdentifier = _destination
        let nip05 = await resolveNip05!(_destination)

        if (
          !nip05?.pubkey &&
          metadataIdentifier &&
          metadataIdentifier !== _destination
        ) {
          resolvedIdentifier = metadataIdentifier
          nip05 = await resolveNip05!(metadataIdentifier)
        }

        if (!nip05?.pubkey) {
          throw new Error(
            `No se pudo resolver NIP-05 para ${_destination}${
              metadataIdentifier ? ` ni para ${metadataIdentifier}` : ''
            }`
          )
        }

        setDestinationLUD06({
          ...lud06,
          lnurl: normalizeLNURL(_destination),
          nip05: resolvedIdentifier,
          nip05Npub: nip05.npub,
          nip05Pubkey: nip05?.pubkey,
          nip05Relays: nip05?.relays
        })

        if (!lud06.allowsNostr) {
          throw new Error('This Lightning Address has no nostr support (NIP-57).')
        }
      } catch (e) {
        alert((e as Error).message)
        removeStoredDestination()
      } finally {
        setIsLoading(false)
      }
    },
    [
      setDestinationLUD06,
      removeStoredDestination,
      resolveNip05
    ]
  )

  useEffect(() => {
    if (!destination) {
      return
    }
    handleSetDestination(decodeURIComponent(destination as string))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination])

  useEffect(() => {
    clear()
    clearOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const destinationName = useMemo(
    () => decodeURIComponent(destination as string),
    [destination]
  )

  return (
    <>
      <Top />
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          {isLoading ? (
            <Flex justify="center">
              <BtnLoader />
            </Flex>
          ) : (
            <>
              <Heading as="h4">
                {destinationName}{' '}
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => removeStoredDestination()}
                >
                  ❌
                </span>
              </Heading>
              {/* TODO: Add Optional bar */}
              {destinationName === 'barra@lacrypta.ar' && (
                <Flex gap={8}>
                  <Card>
                    <Link href="/cart/barra">
                      <Icon>
                        <MenuIcon />
                      </Icon>
                      <Flex direction="column" gap={4}>
                        <Heading as="h5">Barra</Heading>
                        <Text size="small">Barra.</Text>
                      </Flex>
                    </Link>
                  </Card>
                </Flex>
              )}
              {/* TODO: Add Optional merch */}
              {destinationName === 'merch@lacrypta.ar' && (
                <Flex gap={8}>
                  <Card>
                    <Link href="/cart/merch">
                      <Icon>
                        <MenuIcon />
                      </Icon>
                      <Flex direction="column" gap={4}>
                        <Heading as="h5">Merch</Heading>
                        <Text size="small">Merch Shop.</Text>
                      </Flex>
                    </Link>
                  </Card>
                </Flex>
              )}
              {/* TODO: Add Optional food */}
              {destinationName === 'comida@lacrypta.ar' && (
                <Flex gap={8}>
                  <Card>
                    <Link href="/cart/comida">
                      <Icon>
                        <MenuIcon />
                      </Icon>
                      <Flex direction="column" gap={4}>
                        <Heading as="h5">Comida</Heading>
                        <Text size="small">Comida.</Text>
                      </Flex>
                    </Link>
                  </Card>
                </Flex>
              )}
              {/* TODO: Add Optional bitnaria */}
              {destinationName === 'bitnaria@lacrypta.ar' && (
                <Flex gap={8}>
                  <Card>
                    <Link href="/cart/bitnaria">
                      <Icon>
                        <MenuIcon />
                      </Icon>
                      <Flex direction="column" gap={4}>
                        <Heading as="h5">Bitnaria</Heading>
                        <Text size="small">Bitnaria.</Text>
                      </Flex>
                    </Link>
                  </Card>
                </Flex>
              )}

              {/* TODO: Add Optional bitnaria */}
              {destinationName === 'cafe@lacrypta.ar' && (
                <Flex gap={8}>
                  <Card>
                    <Link href="/cart/cafe">
                      <Icon>
                        <MenuIcon />
                      </Icon>
                      <Flex direction="column" gap={4}>
                        <Heading as="h5">Cafe</Heading>
                        <Text size="small">Cafe.</Text>
                      </Flex>
                    </Link>
                  </Card>
                </Flex>
              )}

              {destinationName === TEST_DESTINATION && (
                <Flex gap={8}>
                  <Card>
                    <Link href="/cart/test">
                      <Icon>
                        <MenuIcon />
                      </Icon>
                      <Flex direction="column" gap={4}>
                        <Heading as="h5">Test</Heading>
                        <Text size="small">Menu de prueba.</Text>
                      </Flex>
                    </Link>
                  </Card>
                </Flex>
              )}

              <Flex direction="column" gap={8}>
                <Flex gap={8}>
                  <Card>
                    <Link href="/paydesk">
                      <Icon>
                        <PantheonIcon />
                      </Icon>
                      <Flex direction="column" gap={4}>
                        <Heading as="h5">Cash Register</Heading>
                        <Text size="small">
                          Type the price and pay with your LN.
                        </Text>
                      </Flex>
                    </Link>
                  </Card>
                  <Card>
                    <Link href="/orders">
                      <Icon>
                        <InvoiceIcon />
                      </Icon>
                      <Flex direction="column" gap={4}>
                        <Heading as="h5">Ordenes</Heading>
                        <Text size="small">Historial del POS.</Text>
                      </Flex>
                    </Link>
                  </Card>
                </Flex>
                {tabEnabled && (
                  <Flex gap={8}>
                    <Card color="secondary">
                      <Link href="/tab">
                        <Icon>
                          <InvoiceIcon />
                        </Icon>
                        <Flex direction="column" gap={4}>
                          <Heading as="h5">Cerrar cuenta</Heading>
                          <Text size="small">Cuentas abiertas (tab).</Text>
                        </Flex>
                      </Link>
                    </Card>
                  </Flex>
                )}
              </Flex>
            </>
          )}
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}
