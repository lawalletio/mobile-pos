'use client'

import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

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
  Alert
} from '@/components/UI'
import Container from '@/components/Layout/Container'
import { Loader } from '@/components/Loader/Loader'

import theme from '@/styles/theme'
import { useNostr } from '@/context/Nostr'
import { useOrder } from '@/context/Order'
import { Event } from 'nostr-tools'
import { useLN } from '@/context/LN'
import { useNfc } from 'use-nfc-hook'
import axios from 'axios'
import { LNURLResponse, LNURLWStatus } from '@/types/lnurl'
import { useCard } from '@/hooks/useCard'

export default function Page() {
  const router = useRouter()
  const { orderId: orderIdFromUrl } = useParams()
  const { subscribeZap, getEvent } = useNostr()
  const { zapEmitterPubKey } = useLN()
  const {
    orderId,
    amount,
    setOrderEvent,
    pendingAmount,
    zapEvents,
    requestZapInvoice
  } = useOrder()

  const [invoice, setInvoice] = useState<string>()
  const [cardStatus, setCardStatus] = useState<LNURLWStatus>(LNURLWStatus.IDLE)

  const { isAvailable, permission, scan, stop } = useCard()

  const { userConfig } = useContext(LaWalletContext)

  const [finished, setFinished] = useState<boolean>(false)

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

  const startRead = async () => {
    setCardStatus(LNURLWStatus.REQUESTING)
    const lnurlResponse = await scan()
    processLNURLResponse(lnurlResponse)
  }

  const processLNURLResponse = async (response: LNURLResponse) => {
    setCardStatus(LNURLWStatus.CALLBACK)
    const url = response.callback
    const _response = await axios.get(url, {
      params: { k1: response.k1, pr: invoice }
    })
    if (_response.status !== 200) {
      setCardStatus(LNURLWStatus.ERROR)
      alert('Hubo un error ge')
      alert(JSON.stringify(_response.data))
      return
    }
    setCardStatus(LNURLWStatus.DONE)
  }

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
    if (!orderId || !zapEmitterPubKey) {
      return
    }

    requestZapInvoice!(amount * 1000, orderId).then(_invoice => {
      console.info('INVOICE:')
      setInvoice!(_invoice)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // New zap events
  useEffect(() => {
    if (zapEvents.length <= 0 || finished || pendingAmount > 0) {
      return
    }
    setFinished(true)
  }, [zapEvents, finished, pendingAmount])

  // On Invoice ready
  useEffect(() => {
    if (!invoice || !zapEmitterPubKey || !isAvailable) {
      return
    }

    startRead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, zapEmitterPubKey])

  // On Mount
  useEffect(() => {
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {isAvailable && permission === 'granted' && invoice && (
        <Alert
          title={''}
          description={'Disponible para escanear NFC.'}
          type={'success'}
          isOpen={cardStatus === LNURLWStatus.IDLE}
        />
      )}

      <Alert
        title={''}
        description={'Procesando...'}
        type={'warning'}
        isOpen={
          cardStatus !== LNURLWStatus.IDLE && cardStatus !== LNURLWStatus.DONE
        }
      />

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
              {/* <Flex>
                <Button variant="bezeled" onClick={handlePrint}>
                  Imprimir comprobante
                </Button>
              </Flex> */}
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
                  {isAvailable && permission === 'prompt' && (
                    <Button variant="bezeledGray" onClick={() => startRead()}>
                      Solicitar NFC
                    </Button>
                  )}

                  <Button variant="bezeledGray" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                </Flex>
              </Flex>
              <Divider y={24} />
            </Container>
          </Flex>
        </>
      )}
    </>
  )
}
