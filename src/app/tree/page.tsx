'use client'

// React/Next
import { useCallback, useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Utils
import { formatToPreference } from '@/lib/formatter'

// Components
import { Flex, Heading, Text, Divider, Button, Keyboard } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'
import TokenList from '@/components/TokenList'

// Contexts and Hooks
import { useNumpad } from '@/hooks/useNumpad'
import { useLN } from '@/context/LN'
import { useNostr } from '@/context/Nostr'
import { useOrder } from '@/context/Order'
import { LaWalletContext } from '@/context/LaWalletContext'
import { useCard } from '@/hooks/useCard'
import { ScanAction } from '@/types/card'

export default function Page() {
  // Hooks
  const router = useRouter()
  const { generateOrderEvent, setAmount, setOrderEvent, clear } = useOrder()
  const { publish } = useNostr()
  const query = useSearchParams()
  const { setDestinationLNURL } = useLN()
  const { userConfig } = useContext(LaWalletContext)
  const numpadData = useNumpad(userConfig.props.currency)

  const { isAvailable, scan, stop } = useCard()

  const sats = numpadData.intAmount['SAT']

  // Local states
  const [cardScanned, setCardScanned] = useState<boolean>(false)

  /** Functions */
  const processUrl = useCallback(
    async (url: string) => {
      try {
        await setDestinationLNURL(url)
        setCardScanned(true)
      } catch (e) {
        console.error(e)
        alert('what the hell?' + JSON.stringify(e))
      }
    },
    [setDestinationLNURL]
  )

  const handleClick = async () => {
    // POC
    const order = generateOrderEvent!()

    console.dir(order)
    // console.info('Publishing order')

    publish!(order).catch(e => {
      console.warn('Error publishing order')
      console.warn(e)
    })
    setOrderEvent!(order)

    router.push(`/payment/${order.id}?back=/tree`)
  }

  const startScanning = async () => {
    try {
      const scanned = await scan(ScanAction.WRONG)
      alert(JSON.stringify(scanned))
      // setCardScanned(true);
    } catch (e) {
      console.error(e)
      alert('what the hell?' + JSON.stringify(e))
    }
  }

  /** useEffects */
  useEffect(() => {
    if (numpadData.usedCurrency !== userConfig.props.currency)
      numpadData.modifyCurrency(userConfig.props.currency)
  }, [numpadData, userConfig.props.currency])

  useEffect(() => {
    setAmount(sats)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sats])

  useEffect(() => {
    const url = query.get('data')

    if (!url) {
      return
    }

    console.info('processUrl?')
    processUrl(url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // on mount
  useEffect(() => {
    clear()
    if (isAvailable) {
      startScanning()
      return () => {
        stop()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable])

  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">Modo ARBOLITO</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          {cardScanned ? (
            <>
              <Flex justify="center" align="center" gap={4}>
                {userConfig.props.currency !== 'SAT' && <Text>$</Text>}
                <Heading>
                  {formatToPreference(
                    userConfig.props.currency,
                    numpadData.intAmount[numpadData.usedCurrency]
                  )}
                </Heading>
              </Flex>
              <TokenList />
            </>
          ) : (
            <Flex direction="column" align="center">
              <Heading as="h3">Escaneando receptor...</Heading>
              <Text align="center">
                Acerca la tarjeta de quien desea cargar su tarjeta mediante NFC.
              </Text>
              <Divider y={16} />
              <Flex>
                <Button onClick={() => router.push('/scan')}>
                  Escanear QR
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
        <Divider y={24} />
        {cardScanned && (
          <>
            <Flex gap={8}>
              <Button
                onClick={handleClick}
                color="secondary"
                disabled={!cardScanned}
              >
                Transferir
              </Button>
            </Flex>
            <Divider y={24} />
            <Keyboard numpadData={numpadData} disabled={!cardScanned} />
            <Divider y={24} />
          </>
        )}
      </Container>
    </>
  )
}
