'use client'

// React/Next
import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// Third-party
import axios from 'axios'
import { Event } from 'nostr-tools'

// Types
import { LNURLResponse, LNURLWStatus } from '@/types/lnurl'
import { ScanCardStatus } from '@/types/card'

// Contexts and Hooks
import { useNostr } from '@/context/Nostr'
import { useOrder } from '@/context/Order'
import { useLN } from '@/context/LN'
import { LaWalletContext } from '@/context/LaWalletContext'
import { useCard } from '@/hooks/useCard'
import useCurrencyConverter from '@/hooks/useCurrencyConverter'

// Utils
import { formatToPreference } from '@/lib/formatter'

// Components
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
import { CheckIcon } from '@bitcoin-design/bitcoin-icons-react/filled'
import theme from '@/styles/theme'

export default function Page() {
  // Hooks
  const router = useRouter()
  const { orderId: orderIdFromUrl } = useParams()
  const query = useSearchParams()
  const { getEvent } = useNostr()

  const { convertCurrency } = useCurrencyConverter()
  const { zapEmitterPubKey } = useLN()
  const {
    orderId,
    amount,
    pendingAmount,
    zapEvents,
    setOrderEvent,
    requestZapInvoice
  } = useOrder()
  const { isAvailable, permission, status: scanStatus, scan, stop } = useCard()
  const { userConfig } = useContext(LaWalletContext)

  // Local states
  const [invoice, setInvoice] = useState<string>()
  const [cardStatus, setCardStatus] = useState<LNURLWStatus>(LNURLWStatus.IDLE)
  const [finished, setFinished] = useState<boolean>(false)

  /** Functions */
  const handleBack = useCallback(() => {
    const back = query.get('back')
    if (!back) {
      router.back()
      return
    }
    router.push(back)
  }, [router, query])

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

  /** useEffects */
  // Search for orderIdFromURL
  useEffect(() => {
    // Not orderId found on url
    if (!orderIdFromUrl) {
      handleBack()
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

    requestZapInvoice!(amount * 1000, orderId)
      .then(_invoice => {
        console.info('INVOICE:')
        setInvoice!(_invoice)
      })
      .catch(() => {
        alert("Couldn't generate invoice.")
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

  useEffect(() => {
    switch (scanStatus) {
      case ScanCardStatus.SCANNING:
        setCardStatus(LNURLWStatus.SCANNING)
        break
      case ScanCardStatus.REQUESTING:
        setCardStatus(LNURLWStatus.REQUESTING)
        break
      case ScanCardStatus.ERROR:
        setCardStatus(LNURLWStatus.ERROR)
        break
    }
  }, [scanStatus])

  // On Mount
  useEffect(() => {
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!invoice)
    return (
      <Flex flex={1} align="center" justify="center">
        <Loader />
      </Flex>
    )

  return (
    <>
      {invoice && (
        <Alert
          title={''}
          description={'Disponible para escanear NFC.'}
          type={'success'}
          isOpen={cardStatus === LNURLWStatus.SCANNING}
        />
      )}

      <Alert
        title={''}
        description={
          cardStatus === LNURLWStatus.REQUESTING ? 'Procesando' : 'Cobrando'
        }
        type={'success'}
        isOpen={[LNURLWStatus.REQUESTING, LNURLWStatus.CALLBACK].includes(
          cardStatus
        )}
      />

      <Alert
        title={''}
        description={'Error al cobrar'}
        type={'error'}
        isOpen={cardStatus === LNURLWStatus.ERROR}
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
                  {formatToPreference(
                    userConfig.props.currency,
                    convertCurrency(amount, 'SAT', userConfig.props.currency)
                  )}
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
                <Button variant="bezeledGray" onClick={() => handleBack()}>
                  Volver
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
                    convertCurrency(amount, 'SAT', userConfig.props.currency)
                  )}
                </Heading>

                <Text>{userConfig.props.currency}</Text>
              </Flex>
            </Flex>
            <Divider y={24} />
          </Container>

          <QRCode value={invoice} />

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

                  <Button variant="bezeledGray" onClick={() => handleBack()}>
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
