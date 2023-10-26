'use client'

import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  CheckIcon,
  CreditCardIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'

import { LaWalletContext } from '@/context/LaWalletContext'
import { formatToPreference } from '@/lib/formatter'

import {
  Flex,
  Heading,
  Text,
  Divider,
  Button,
  QRCode,
  Confetti,
  Icon,
  Sheet
} from '@/components/UI'
import Container from '@/components/Layout/Container'
import { Loader } from '@/components/Loader/Loader'
import { useNumpad } from '@/hooks/useNumpad'

import theme from '@/styles/theme'
import { useNostr } from '@/context/Nostr'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { useOrder } from '@/context/Order'
import { Event } from 'nostr-tools'
import { useLN } from '@/context/LN'

export default function Payment() {
  const router = useRouter()
  const { orderId: orderIdFromUrl } = useParams()
  const { subscribeZap, getEvent } = useNostr()
  const { recipientPubkey } = useLN()
  const {
    orderId,
    amount,
    setOrderEvent,
    pendingAmount,
    zapEvents,
    requestZapInvoice
  } = useOrder()

  const [invoice, setInvoice] = useState<string>()

  const { userConfig } = useContext(LaWalletContext)
  const numpadData = useNumpad(userConfig.props.currency)

  const [finished, setFinished] = useState<boolean>(false)
  const [showSheet, setShowSeet] = useState<boolean>(false)

  const handlePrint = () => {}

  const handleCloseSheet = () => {
    setShowSeet(false)
  }

  const fetchOrder = useCallback(
    async (_orderId: string) => {
      const order = await getEvent!(_orderId)

      if (!order) {
        alert('NO HAY ORDER!')
        return
      }

      setOrderEvent!((await order.toNostrEvent()) as Event)

      console.info('ORDER:')
      console.dir(order)
    },
    [getEvent, setOrderEvent]
  )

  // Search for orderIdFromURL
  useEffect(() => {
    // Not orderId found on url
    if (!orderIdFromUrl) {
      router.back()
      return
    }

    // Order already set
    if (orderId) {
      return
    }

    fetchOrder(orderIdFromUrl as string)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromUrl, orderId])

  // On orderId change
  useEffect(() => {
    if (!orderId || !recipientPubkey) {
      return
    }

    requestZapInvoice!(amount * 1000, orderId).then(_invoice => {
      console.info('INVOICE:')
      setInvoice!(_invoice)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  useEffect(() => {
    if (zapEvents.length <= 0 || finished || pendingAmount > 0) {
      return
    }
    setFinished(true)
  }, [zapEvents, finished, pendingAmount])

  return (
    <>
      {finished ? (
        <>
          <Confetti />
          <Container size="small">
            <Divider y={24} />
            <Flex
              direction="column"
              justify="center"
              flex={1}
              align="center"
              gap={8}
            >
              <Icon color={theme.colors.primary}>
                <CheckIcon />
              </Icon>
              <Text size="small" color={theme.colors.gray50}>
                Pago acreditado
              </Text>

              <Flex justify="center" align="center" gap={4}>
                {userConfig.props.currency !== 'SAT' && <Text>$</Text>}
                <Heading>
                  {formatToPreference(userConfig.props.currency, amount)}
                </Heading>
              </Flex>
            </Flex>
            <Flex gap={8} direction="column">
              <Flex>
                <Button variant="bezeled" onClick={handlePrint}>
                  Imprimir comprobante
                </Button>
              </Flex>
              <Flex>
                <Button variant="bezeledGray" onClick={() => router.push('/')}>
                  Cancelar
                </Button>
              </Flex>
            </Flex>
            <Divider y={24} />
          </Container>
        </>
      ) : (
        <>
          <Container size="small">
            <Divider y={24} />
            <Flex
              direction="column"
              justify="center"
              align="center"
              gap={8}
              flex={1}
            >
              <Loader />
              <Text size="small" color={theme.colors.gray50}>
                Esperando pago
              </Text>
              <Flex justify="center" align="center" gap={4}>
                {userConfig.props.currency !== 'SAT' && <Text>$</Text>}
                <Heading>
                  {formatToPreference(
                    userConfig.props.currency,
                    amount
                    // numpadData.intAmount[numpadData.usedCurrency]
                  )}
                </Heading>

                <Text>{userConfig.props.currency}</Text>
              </Flex>
            </Flex>
            <Divider y={24} />
          </Container>

          <QRCode value={invoice ? invoice : 'Wait'} />

          <Flex>
            <Container size="small">
              <Divider y={16} />
              <Flex gap={8} direction="column">
                <Flex>
                  <Button variant="bezeled" onClick={() => setShowSeet(true)}>
                    Escanear tarjeta
                  </Button>
                </Flex>
                <Flex>
                  <Button
                    variant="bezeledGray"
                    onClick={() => router.push('/')}
                  >
                    Cancelar
                  </Button>
                </Flex>
              </Flex>
              <Divider y={24} />
            </Container>
          </Flex>
        </>
      )}

      <Sheet
        title={'Listo para escanear'}
        isOpen={showSheet}
        onClose={handleCloseSheet}
      >
        <Container>
          <Flex direction="column" flex={1} align="center" justify="center">
            <Icon color={theme.colors.primary}>
              <CreditCardIcon />
            </Icon>
            <Divider y={8} />
            <Text align="center">
              Sostenga su dispositivo cerca de la etiqueta NFC.
            </Text>
          </Flex>
        </Container>
      </Sheet>
    </>
  )
}
