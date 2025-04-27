'use client'

// React/Next
import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// Third-party
import axios from 'axios'

// Types
import { LNURLResponse, LNURLWStatus } from '@/types/lnurl'
import { ScanAction, ScanCardStatus } from '@/types/card'

// Contexts and Hooks
import { useOrder } from '@/context/Order'
import { useLN } from '@/context/LN'
import { useCard } from '@/hooks/useCard'
import { usePrint } from '@/hooks/usePrint'
import useCurrencyConverter from '@/hooks/useCurrencyConverter'
import { LaWalletContext } from '@/context/LaWalletContext'

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
import { PrintOrder } from '@/types/print'
import { useProxy } from '@/context/Proxy'
import { useBitcoinBlock } from '@/context/BitcoinBlock'

export default function Page() {
  // Hooks
  const router = useRouter()
  const { orderId: orderIdFromUrl } = useParams()
  const query = useSearchParams()
  const [error, setError] = useState<string>()
  const [cardLnurlResponse, setCardLnurlResponse] = useState<LNURLResponse>()
  const [cardUrl, setCardUrl] = useState<string>()
  const { convertCurrency, pricesData } = useCurrencyConverter()
  const { zapEmitterPubKey } = useLN()
  const { lastBlockNumber } = useBitcoinBlock()
  const {
    orderId,
    amount,
    products,
    isPaid,
    isPrinted,
    currentInvoice: invoice,
    error: orderError,
    isCheckEmergencyEvent,
    handleEmergency,
    setCheckEmergencyEvent,
    setIsPrinted,
    loadOrder
  } = useOrder()
  const { isAvailable, permission, status: scanStatus, scan, stop } = useCard()
  const { print } = usePrint()
  const { transfer, internalTransfer, isEnabled: isProxyEnabled } = useProxy()

  const { userConfig } = useContext(LaWalletContext)

  // Local states
  const [cardStatus, setCardStatus] = useState<LNURLWStatus>(LNURLWStatus.IDLE)

  /** Functions */
  const handleBack = useCallback(() => {
    const back = query.get('back')
    if (!back) {
      router.back()
      return
    }
    router.replace(back)
  }, [query, router])

  const settleProxy = useCallback(
    (cardUrl: string, cardLnurlResponse: LNURLResponse) => {
      let pendingToTransfer = amount * 1000
      if (cardUrl.split('/')[2] === 'api.lacrypta.ar') {
        try {
          const satsback = Math.round(pendingToTransfer * 0.3)
          internalTransfer(satsback, cardLnurlResponse.accountPubKey!)
          pendingToTransfer -= satsback
        } catch (e) {
          console.error('Satsback failed ', e)
        }
      }
      // transfer to proxee
      transfer(pendingToTransfer)
    },
    [amount, transfer, internalTransfer]
  )

  const processRegularPayment = useCallback(
    async (response: LNURLResponse) => {
      setCardStatus(LNURLWStatus.CALLBACK)
      const url = response.callback
      const _response = await axios.get(url, {
        params: { k1: response.k1, pr: invoice }
      })

      if (_response.status < 200 || _response.status >= 300) {
        throw new Error(`Error al intentar cobrar ${_response.status}}`)
      }
      if (_response.data.status !== 'OK') {
        throw new Error(`Error al intentar cobrar ${_response.data.reason}}`)
      }
      setCardStatus(LNURLWStatus.DONE)
    },
    [invoice]
  )

  const startRead = useCallback(async () => {
    try {
      const { cardUrl, lnurlResponse } = await scan(ScanAction.PAY_REQUEST)
      setCardLnurlResponse(lnurlResponse)
      setCardUrl(cardUrl)
      await processRegularPayment(lnurlResponse)
    } catch (e) {
      setCardStatus(LNURLWStatus.ERROR)
      setError((e as Error).message)
    }
  }, [processRegularPayment, scan])

  /** useEffects */
  // Search for orderIdFromURL
  useEffect(() => {
    // Not orderId found on url
    if (!orderIdFromUrl) {
      handleBack()
      return
    }

    // Order already set
    if (orderId === orderIdFromUrl) {
      return
    }

    // fetchOrder(orderIdFromUrl as string)
    if (!loadOrder(orderIdFromUrl as string)) {
      alert('No se encontró la orden')
      handleBack()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromUrl, orderId, loadOrder])

  // on Invoice ready
  useEffect(() => {
    if (!invoice || !zapEmitterPubKey || !isAvailable) {
      return
    }

    startRead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, zapEmitterPubKey])

  // new zap events
  useEffect(() => {
    if (!isPaid || isPrinted) {
      return
    }

    isProxyEnabled &&
      cardLnurlResponse &&
      settleProxy(cardUrl!, cardLnurlResponse)

    const printOrder = {
      total: convertCurrency(amount, 'SAT', 'ARS'),
      totalSats: amount,
      currency: 'ARS',
      items: products.map(product => ({
        name: product.name,
        price: product.price.value,
        qty: product.qty
      })),
      // imageUrl: 'https://agustin.masize.com/examples/posta.png',
      blockNumber: lastBlockNumber.toLocaleString('en-US'),
      btcPrice: (pricesData.USD * 100).toFixed(2) + ' M',
      currencyB: 'USD',
      totalB: Math.max(pricesData.USD * amount, 0.01).toFixed(2)
    } as PrintOrder

    console.dir('printOrder:')
    console.dir(printOrder)
    print(printOrder)
    setIsPrinted!(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid, amount, products, print])

  // on card scanStatus change
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

  // on Mount
  useEffect(() => {
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (orderError && !isPaid) {
    return (
      <Flex gap={8} direction="column">
        <Flex>
          <Text>{orderError}</Text>
        </Flex>

        <Flex>
          <Button variant="bezeledGray" onClick={() => handleBack()}>
            Volver
          </Button>
        </Flex>
      </Flex>
    )
  }

  if (!invoice)
    return (
      <Flex flex={1} align="center" justify="center">
        <Loader />
      </Flex>
    )

  return (
    <>
      <Alert
        title={''}
        description={'Disponible para escanear NFC.'}
        type={'success'}
        isOpen={cardStatus === LNURLWStatus.SCANNING}
      />

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
        description={`Error al cobrar: ${error}`}
        type={'error'}
        isOpen={cardStatus === LNURLWStatus.ERROR}
      />

      {isCheckEmergencyEvent ? (
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
              <Heading>Checking events</Heading>
              <Text>Looking for Zap and Internal...</Text>
            </Flex>
            <Divider y={24} />
          </Container>

          <Flex>
            <Container size="small">
              <Divider y={16} />
              <Flex gap={8} direction="column">
                <Flex gap={8}>
                  <Button variant="bezeledGray" onClick={() => handleBack()}>
                    Back
                  </Button>
                  <Button
                    variant="bezeledGray"
                    onClick={() => {
                      handleEmergency()
                    }}
                  >
                    Check event
                  </Button>
                </Flex>
              </Flex>
              <Divider y={24} />
            </Container>
          </Flex>
        </>
      ) : isPaid ? (
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
          <Text>{isProxyEnabled ? 'Proxy enabled' : 'Proxy disabled'}</Text>

          <Flex>
            <Container size="small">
              <Divider y={16} />
              <Flex gap={8} direction="column">
                <Flex gap={8}>
                  {isAvailable && permission === 'prompt' && (
                    <Button variant="bezeledGray" onClick={() => startRead()}>
                      Solicitar NFC
                    </Button>
                  )}

                  <Button variant="bezeledGray" onClick={() => handleBack()}>
                    Cancelar
                  </Button>
                  <Button
                    variant="bezeledGray"
                    onClick={() => {
                      setCheckEmergencyEvent(true)
                      handleEmergency()
                    }}
                  >
                    Check event
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
