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
import { useNostr } from '@/context/Nostr'

export default function Page() {
  // Hooks
  const router = useRouter()
  const { orderId: orderIdFromUrl } = useParams()
  const query = useSearchParams()
  const [error, setError] = useState<string>()

  const { convertCurrency } = useCurrencyConverter()
  const { zapEmitterPubKey, lud06, destinationPubKey } = useLN()
  const {
    orderId,
    amount,
    products,
    isPaid,
    isPrinted,
    currentInvoice: invoice,
    emergency,
    isCheckEmergencyEvent,
    handleEmergency,
    setCheckEmergencyEvent,
    setIsPrinted,
    loadOrder
  } = useOrder()
  const { isAvailable, permission, status: scanStatus, scan, stop } = useCard()
  const { localPrivateKey, relays, ndk, getBalance } = useNostr()
  const { print } = usePrint()

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
    router.push(back)
  }, [router, query])

  const processRegularPayment = useCallback(
    async (cardUrl: string, response: LNURLResponse) => {
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
      await processRegularPayment(cardUrl, lnurlResponse)
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
    if (orderId) {
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

    const printOrder = {
      total: convertCurrency(amount, 'SAT', 'ARS'),
      totalSats: amount,
      currency: 'ARS',
      items: products.map(product => ({
        name: product.name,
        price: product.price.value,
        qty: product.qty
      }))
    }

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

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.info('Checking for events...')
  //     if (!isPaid) {
  //       console.info('No paid, checking for emergency event...')
  //       handleEmergency(internalTxFilter!)
  //     } else {
  //       console.info('Paid, stopping interval...')
  //       clearInterval(interval)
  //     }
  //   }, 2000)

  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [isPaid, handleEmergency])

  // on Mount
  useEffect(() => {
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (emergency && !isPaid) {
    return (
      <Flex gap={8} direction="column">
        <Flex>
          caca
          <Button
            variant="bezeledGray"
            onClick={() => {
              setCheckEmergencyEvent(true)
              handleEmergency()
              handleBack()
            }}
          >
            Emergency
          </Button>
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
