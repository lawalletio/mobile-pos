'use client'

// React/Next
import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useLocalStorage } from 'react-use-storage'

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
import { useTabs } from '@/hooks/useTabs'
import useCurrencyConverter from '@/hooks/useCurrencyConverter'
import { LaWalletContext } from '@/context/LaWalletContext'

// Utils
import { formatToPreference, roundToDown } from '@/lib/formatter'

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
  Alert,
  Sheet
} from '@/components/UI'
import Container from '@/components/Layout/Container'
import Input from '@/components/UI/Input'
import { Loader } from '@/components/Loader/Loader'
import { CheckIcon } from '@bitcoin-design/bitcoin-icons-react/filled'
import theme from '@/styles/theme'
import { PrintOrder } from '@/types/print'
import { ProductQtyData } from '@/types/product'
import { ITab } from '@/types/tab'
import { useBitcoinBlock } from '@/context/BitcoinBlock'

export default function Page() {
  // Hooks
  const router = useRouter()
  const { orderId: orderIdFromUrl } = useParams()
  const query = useSearchParams()
  const [lastCheckoutBack] = useLocalStorage('lastCheckoutBack', '')
  const [tabEnabled] = useLocalStorage<boolean>('tabEnabled', false)
  const [tipEnabled] = useLocalStorage<boolean>('tipEnabled', false)
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
    loadOrder,
    clear,
    setAmount,
    setProducts,
    setOrderEvent,
    generateOrderEvent,
    publishOrderInBackground
  } = useOrder()
  const { isAvailable, permission, status: scanStatus, scan, stop } = useCard()
  const { print } = usePrint()
  const { tabs, addToTab, removeTab } = useTabs()
  const { userConfig } = useContext(LaWalletContext)
  const tabId = query.get('tab')

  // Local states
  const [cardStatus, setCardStatus] = useState<LNURLWStatus>(LNURLWStatus.IDLE)
  const [error, setError] = useState<string>()
  const [showTabSheet, setShowTabSheet] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [addedTab, setAddedTab] = useState<ITab | null>(null)
  const [showTabDetails, setShowTabDetails] = useState(false)

  /** Functions */
  const handleBack = useCallback(() => {
    clear()
    const back = query.get('back')
    const target =
      back && back !== '/tip'
        ? back
        : lastCheckoutBack && lastCheckoutBack !== '/tip'
          ? lastCheckoutBack
          : '/'
    router.replace(target)
  }, [clear, lastCheckoutBack, query, router])

  const handleAddToTab = (name: string, existingId?: string) => {
    const trimmed = name.trim()
    if (!trimmed || amount <= 0) return

    const tabItems: ProductQtyData[] =
      products.length > 0
        ? products
        : [
            {
              id: 0,
              category_id: 0,
              name: 'Caja',
              description: '',
              price: { value: amount, currency: 'SAT' },
              qty: 1
            }
          ]

    const tab = addToTab(trimmed, tabItems, amount, existingId)
    setShowTabSheet(false)
    setNewCustomerName('')
    setShowTabDetails(false)
    setAddedTab(tab)
  }

  const handleCloseTab = (tab: ITab) => {
    if (tab.amount <= 0) return

    setAddedTab(null)
    setAmount(tab.amount)
    setProducts(tab.items)

    if (tipEnabled) {
      router.push(`/tip?back=/tab&tab=${tab.id}`)
      return
    }

    const order = generateOrderEvent!(tab.amount, tab.items)
    publishOrderInBackground!(order)
    setOrderEvent!(order)
    router.push(`/payment/${order.id}?back=/tab&tab=${tab.id}`)
  }

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
      const { lnurlResponse } = await scan(ScanAction.PAY_REQUEST)
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
      btcPrice: roundToDown(pricesData.USD * 100, 2).toFixed(2) + ' M',
      currencyB: 'USD',
      totalB: Math.max(pricesData.USD * amount, 0.01).toFixed(2)
    } as PrintOrder

    console.dir('printOrder:')
    console.dir(printOrder)
    print(printOrder)
    setIsPrinted!(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid, amount, products, print])

  // Clear the customer's tab once their account is settled
  useEffect(() => {
    if (isPaid && tabId) {
      removeTab(tabId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid, tabId])

  // Auto-close the "added to tab" confirmation after 2s (unless details opened)
  useEffect(() => {
    if (!addedTab || showTabDetails) {
      return
    }

    const timer = setTimeout(() => handleBack(), 2000)
    return () => clearTimeout(timer)
  }, [addedTab, showTabDetails, handleBack])

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

  if (addedTab) {
    const totalItems = addedTab.items.reduce((sum, item) => sum + item.qty, 0)

    return (
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
            <Icon color={theme.colors.primary}>
              <CheckIcon />
            </Icon>
            <Text size="small" color={theme.colors.gray50}>
              Agregado a la cuenta
            </Text>
            <Heading>{addedTab.name}</Heading>
            <Flex justify="center" align="center" gap={4}>
              <Heading>{addedTab.amount}</Heading>
              <Text>SAT</Text>
            </Flex>
            <Text size="small" color={theme.colors.gray50}>
              $
              {formatToPreference(
                'ARS',
                convertCurrency(addedTab.amount, 'SAT', 'ARS')
              )}{' '}
              ARS
            </Text>

            {showTabDetails && (
              <>
                <Divider y={8} />
                <Flex direction="column" gap={4}>
                  {addedTab.items.map(item => (
                    <Text key={item.id} size="small">
                      {item.qty}x {item.name}
                    </Text>
                  ))}
                </Flex>
                <Text size="small" color={theme.colors.gray50}>
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Text>
              </>
            )}
          </Flex>
          <Divider y={24} />
        </Container>

        <Flex>
          <Container size="small">
            <Divider y={16} />
            <Flex gap={8} direction="column">
              {showTabDetails ? (
                <>
                  <Flex>
                    <Button
                      variant="bezeled"
                      onClick={() => handleCloseTab(addedTab)}
                    >
                      Cerrar cuenta ({addedTab.amount} SAT)
                    </Button>
                  </Flex>
                  <Flex>
                    <Button
                      variant="bezeledGray"
                      onClick={() => handleBack()}
                    >
                      Volver
                    </Button>
                  </Flex>
                </>
              ) : (
                <Flex>
                  <Button
                    variant="bezeledGray"
                    onClick={() => setShowTabDetails(true)}
                  >
                    Ver detalle
                  </Button>
                </Flex>
              )}
            </Flex>
            <Divider y={24} />
          </Container>
        </Flex>
      </>
    )
  }

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
        {amount <= 0 ? (
          <Flex direction="column" gap={8} align="center">
            <Text>No se pudo generar la invoice.</Text>
            <Text size="small">La orden no tiene monto.</Text>
            <Button variant="bezeledGray" onClick={() => handleBack()}>
              Volver
            </Button>
          </Flex>
        ) : (
          <Loader />
        )}
      </Flex>
    )

  return (
    <>
      <Alert
        title={''}
        description={'Ready for NFC tapping.'}
        type={'success'}
        isOpen={cardStatus === LNURLWStatus.SCANNING}
      />

      <Alert
        title={''}
        description={
          cardStatus === LNURLWStatus.REQUESTING ? 'Processing' : 'Transferring'
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
                Waiting for payment
              </Text>
              <Flex justify="center" align="center" gap={4}>
                <Heading>{amount}</Heading>
                <Text>SAT</Text>
              </Flex>
              <Text size="small" color={theme.colors.gray50}>
                $
                {formatToPreference(
                  'ARS',
                  convertCurrency(amount, 'SAT', 'ARS')
                )}{' '}
                ARS
              </Text>
            </Flex>
            <Divider y={24} />
          </Container>

          <QRCode value={invoice} />

          <Flex>
            <Container size="small">
              <Divider y={16} />
              <Flex gap={8} direction="column">
                {tabEnabled && !tabId && (
                  <Flex>
                    <Button
                      variant="bezeled"
                      onClick={() => setShowTabSheet(true)}
                    >
                      Agregar a tab
                    </Button>
                  </Flex>
                )}
                <Flex gap={8}>
                  {isAvailable && permission === 'prompt' && (
                    <Button variant="bezeledGray" onClick={() => startRead()}>
                      Solicitar NFC
                    </Button>
                  )}

                  <Button variant="bezeledGray" onClick={() => handleBack()}>
                    Cancel
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

      <Sheet
        isOpen={showTabSheet}
        onClose={() => {
          setShowTabSheet(false)
          setNewCustomerName('')
        }}
        title="Agregar a tab"
      >
        <Container>
          <Divider y={8} />
          <Flex direction="column" gap={8}>
            <Input
              value={newCustomerName}
              onChange={e => setNewCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
            />
            <Flex>
              <Button
                color="secondary"
                variant="bezeled"
                onClick={() => handleAddToTab(newCustomerName)}
              >
                Crear y agregar
              </Button>
            </Flex>
          </Flex>
          <Divider y={16} />
          {Object.values(tabs).length > 0 && (
            <Flex direction="column" gap={8}>
              <Text size="small" color={theme.colors.gray50}>
                Clientes
              </Text>
              {Object.values(tabs).map(tab => (
                <Flex key={tab.id}>
                  <Button
                    variant="bezeledGray"
                    onClick={() => handleAddToTab(tab.name, tab.id)}
                  >
                    {tab.name}
                  </Button>
                </Flex>
              ))}
            </Flex>
          )}
          <Divider y={16} />
        </Container>
      </Sheet>
    </>
  )
}
