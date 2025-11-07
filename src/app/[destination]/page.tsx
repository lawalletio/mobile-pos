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
import { useProxy } from '@/context/Proxy'
import { useOrder } from '@/context/Order'

// Utils
import { fetchLNURL } from '@/lib/utils'

// Components
import { Flex, Heading, Text, Divider, Icon, Card } from '@/components/UI'
import Container from '@/components/Layout/Container'
import {
  PantheonIcon,
  GearIcon,
  MenuIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'
import { BtnLoader } from '@/components/Loader/Loader'

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [, setStoredDestination] = useLocalStorage('destination', '')

  // Hooks
  const router = useRouter()
  const { destination } = useParams()
  const { clear } = useLN()
  const { clear: clearOrder } = useOrder()
  const { enableProxy, isEnabled: isProxyEnabled } = useProxy()
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
        setDestinationLUD06(lud06)
        if (isProxyEnabled) {
          return
        }

        // disabled proxy
        if (!lud06.allowsNostr) {
          confirm(
            'This Lightning Address has no nostr support (NIP-57).\nDo you want to enable Proxy?'
          )
            ? enableProxy()
            : removeStoredDestination()
        }
      } catch (e) {
        alert((e as Error).message)
        removeStoredDestination()
      } finally {
        setIsLoading(false)
      }
    },
    [setDestinationLUD06, enableProxy, removeStoredDestination, isProxyEnabled]
  )

  useEffect(() => {
    if (!destination) {
      return
    }
    handleSetDestination(decodeURIComponent(destination as string))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, isProxyEnabled])

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
                <Card color="secondary">
                  <Link href="/settings">
                    <Icon>
                      <GearIcon />
                    </Icon>
                    <Flex direction="column" gap={4}>
                      <Heading as="h5">Settings</Heading>
                      <Text size="small">POS Configuration</Text>
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
