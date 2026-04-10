'use client'

// React
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

// Types
import type { Dispatch, SetStateAction } from 'react'
import type { Event, UnsignedEvent } from 'nostr-tools'
import { useLN } from './LN'
import { NDKEvent, NDKRelay, NDKSubscription } from '@nostr-dev-kit/ndk'
import { ProductQtyData } from '@/types/product'
import { IPayment, IPaymentCache } from '@/types/order'

// Contexts and Hooks
import { useNostr } from './Nostr'
import { useLocalStorage } from 'react-use-storage'

// Utils
import bolt11 from 'bolt11'
import { parseZapInvoice } from '@/lib/utils'
import { finalizeEvent, validateEvent } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils'
import { LNURLInvoiceResponseSuccess, LNURLVerifyResponse } from '@/types/lnurl'
import { useVerifyLud21 } from '@/hooks/useVerifyLud21'

// Interface
export interface IOrderContext {
  orderId?: string
  amount: number
  fiatAmount: number
  fiatCurrency?: string
  currentInvoice?: string
  memo: unknown
  products: ProductQtyData[]
  isPaid?: boolean
  isPrinted?: boolean
  orderEvent: Event | undefined
  paymentsCache?: IPaymentCache
  error: string | undefined
  isCheckEmergencyEvent: boolean
  handleEmergency: () => void
  setCheckEmergencyEvent: Dispatch<SetStateAction<boolean>>
  loadOrder: (orderId: string) => boolean
  setIsPrinted?: Dispatch<SetStateAction<boolean>>
  setIsPaid?: Dispatch<SetStateAction<boolean>>
  setProducts: Dispatch<SetStateAction<ProductQtyData[]>>
  clear: () => void
  setMemo: Dispatch<SetStateAction<unknown>>
  setAmount: Dispatch<SetStateAction<number>>
  checkOut: () => Promise<{ eventId: string }>
  setOrderEvent?: Dispatch<SetStateAction<Event | undefined>>
  generateOrderEvent?: () => Event
  setFiatAmount: Dispatch<SetStateAction<number>>
  requestZapInvoice?: (
    amountMillisats: number,
    orderEventId: string
  ) => Promise<LNURLInvoiceResponseSuccess>
}

// Context
export const OrderContext = createContext<IOrderContext>({
  amount: 0,
  fiatAmount: 0,
  fiatCurrency: 'ARS',
  memo: undefined,
  error: undefined,
  products: [],
  checkOut: function (): Promise<{ eventId: string }> {
    throw new Error('Function not implemented.')
  },
  setAmount: function (): void {
    throw new Error('Function not implemented.')
  },
  setFiatAmount: function (): void {
    throw new Error('Function not implemented.')
  },
  setMemo: function (_value: unknown): void {
    throw new Error('Function not implemented.')
  },
  clear: function (): void {
    throw new Error('Function not implemented.')
  },
  setProducts: function (value: SetStateAction<ProductQtyData[]>): void {
    throw new Error('Function not implemented.')
  },
  loadOrder: function (orderId: string): boolean {
    throw new Error('Function not implemented.')
  },
  orderEvent: undefined,
  paymentsCache: undefined,
  isCheckEmergencyEvent: false,
  handleEmergency: function (): void {
    throw new Error('Function not implemented.')
  },
  setCheckEmergencyEvent: function (): void {
    throw new Error('Function not implemented.')
  }
})

// Component Props
interface IOrderProviderProps {
  children: React.ReactNode
}

export const OrderProvider = ({ children }: IOrderProviderProps) => {
  // Local states
  const [subZap, setSubZap] = useState<NDKSubscription | undefined>(undefined)
  const [orderId, setOrderId] = useState<string>()
  const [isPaid, setIsPaid] = useState<boolean>(false)
  const isPaidRef = useRef(false)
  const [isPrinted, setIsPrinted] = useState<boolean>(false)
  const [orderEvent, setOrderEvent] = useState<Event>()
  const [amount, setAmount] = useState<number>(0)
  const [memo, setMemo] = useState<unknown>({})
  const [lud21, setLUD21] = useState<string>()
  const [currentInvoice, setCurrentInvoice] = useState<string>()
  const [fiatAmount, setFiatAmount] = useState<number>(0)
  const [fiatCurrency, setFiatCurrency] = useState<string>('ARS')
  const [products, setProducts] = useState<ProductQtyData[]>([])
  const [error, setError] = useState<string | undefined>(undefined)
  const [paymentsCache, setPaymentsCache] = useLocalStorage<IPaymentCache>(
    'paymentsCache',
    {}
  )

  // Hooks
  const { relays, localPublicKey, localPrivateKey, generateZapEvent } =
    useNostr()
  const { lud06, zapEmitterPubKey, requestInvoice, setLUD06 } = useLN()
  const { ndk, filter, subscribeZap, publish } = useNostr()
  const lud21Paid = useVerifyLud21({
    enabled: !isPaid,
    lud21VerifyUrl: lud21 || '',
    delay: 2000
  })

  // Keep ref in sync for synchronous checks across async callbacks
  useEffect(() => {
    isPaidRef.current = isPaid
  }, [isPaid])

  const [isCheckEmergencyEvent, setCheckEmergencyEvent] =
    useState<boolean>(false)

  const generateOrderEvent = useCallback((): Event => {
    const unsignedEvent: UnsignedEvent = {
      kind: 1,
      content: '',
      pubkey: localPublicKey!,
      created_at: Math.round(Date.now() / 1000),
      tags: [
        ['relays', ...relays!],
        ['p', localPublicKey],
        ['t', 'order'],
        [
          'description',
          JSON.stringify({
            memo,
            amount
          })
        ],
        ['products', JSON.stringify(products)]
      ] as string[][]
    }

    const event = finalizeEvent(unsignedEvent, hexToBytes(localPrivateKey!))

    // Saving current payments status
    const payment: IPayment = {
      amount,
      event: event!,
      id: event!.id,
      isPaid,
      lud06: lud06!,
      isPrinted: isPrinted,
      items: products
    }

    setPaymentsCache({ ...paymentsCache, [payment.id]: payment })

    return event
  }, [
    localPublicKey,
    relays,
    memo,
    amount,
    products,
    localPrivateKey,
    isPaid,
    lud06,
    isPrinted,
    paymentsCache,
    setPaymentsCache
  ])

  // Load order from cache
  const loadOrder = useCallback(
    (orderId: string): boolean => {
      console.info('Loading order from cache')
      const order = paymentsCache[orderId]
      if (!order) {
        return false
      }
      // Clear stale invoice/lud21 before loading new order
      setCurrentInvoice(undefined)
      setLUD21(undefined)
      setAmount(order.amount)
      setIsPaid(order.isPaid)
      setIsPrinted(order.isPrinted)
      setProducts(order.items)
      setOrderEvent(order.event)
      setLUD06(order.lud06)
      setOrderId(order.id)

      console.dir(order)
      return true
    },
    [paymentsCache, setLUD06]
  )

  // Checkout function
  const checkOut = useCallback(async (): Promise<{
    eventId: string
  }> => {
    // Order Nostr event
    const order = generateOrderEvent()
    await publish!(order)

    return { eventId: order.id }
  }, [generateOrderEvent, publish])

  const requestZapInvoice = useCallback(
    async (
      amountMillisats: number,
      orderEventId: string
    ): Promise<LNURLInvoiceResponseSuccess> => {
      // Generate ZapRequestEvent
      const zapEvent = generateZapEvent!(amountMillisats, orderEventId)

      console.info('zapEvent')
      console.dir(zapEvent)

      // Request new invoice
      const invoice = await requestInvoice!({
        amountMillisats,
        zapEvent: (await zapEvent.toNostrEvent()) as Event
      })

      if (!('pr' in invoice)) {
        throw new Error('Error requesting invoice', {
          cause: invoice.reason
        })
      }

      return invoice
    },
    [generateZapEvent, requestInvoice]
  )

  const handlePaymentReceived = useCallback(
    async (event: NDKEvent) => {
      if (isPaidRef.current) return
      console.info('handlePaymentReceived in Order.tsx')
      const invoice = parseZapInvoice(event as Event)
      if (!invoice.complete) {
        console.info('Incomplete invoice')
        return
      }
      const amountPaid = parseInt(invoice.millisatoshis!) / 1000
      if (amountPaid >= amount) {
        setIsPaid(true)
      }
    },
    [amount]
  )

  // Handle new incoming zap
  const onZap = useCallback(
    (event: NDKEvent) => {
      console.info('onZap in Order.tsx')
      console.dir(event)
      if (event.pubkey !== zapEmitterPubKey) {
        console.error('Invalid Recipient Pubkey:', event.pubkey, '!==', zapEmitterPubKey)
        return
      }

      if (!validateEvent(event)) {
        console.error('Invalid event')
        return
      }

      const paidInvoice = event.tags.find(tag => tag[0] === 'bolt11')?.[1]
      if (!paidInvoice) {
        console.error('No bolt11 tag found in zap event')
        return
      }

      const decodedPaidInvoice = bolt11.decode(paidInvoice)
      handlePaymentReceived(event)
      console.info('Amount paid : ' + decodedPaidInvoice.millisatoshis)
    },
    [zapEmitterPubKey, handlePaymentReceived]
  )

  const handleEmergency = useCallback(async () => {
    console.dir('[EMERGENCY] handleEmergency in Order.tsx')

    if (isPaidRef.current) {
      console.info('Already paid, skipping emergency check')
      setCheckEmergencyEvent(false)
      return
    }

    try {
      // Check LUD21 if exists
      if (lud21) {
        try {
          console.info('Checking LUD21')
          const lud21Response = await fetch(lud21)

          const verifyResponse =
            (await lud21Response.json()) as LNURLVerifyResponse
          if (verifyResponse.status === 'OK' && verifyResponse.settled) {
            setIsPaid(true)
            return
          }
        } catch (err) {
          console.error('Error getting LUD21:', err)
        }
      }

      // Force fetch event from relays
      if (!filter) {
        console.error('No filter available for relay fetch')
        return
      }

      console.info('Fetching event from relays')
      const event = await ndk.fetchEvent(JSON.parse(filter))
      console.dir(event)
      if (event) {
        try {
          onZap(event)
        } catch (err) {
          console.error('Error processing zap event:', err)
        }
        return
      }
    } catch (err) {
      console.error('Error en fetch:', err)
    } finally {
      setCheckEmergencyEvent(false)
    }
  }, [lud21, filter, ndk, onZap])

  const clear = useCallback(() => {
    setOrderId(undefined)
    setOrderEvent(undefined)
    setAmount(0)
    setFiatAmount(0)
    setIsPaid(false)
    isPaidRef.current = false
    setCurrentInvoice(undefined)
    setLUD21(undefined)
    setIsPrinted(false)
    setProducts([])
    setMemo({})
    setError(undefined)
    setCheckEmergencyEvent(false)
    setSubZap(undefined)
    invoiceRequestIdRef.current++  // Invalidate any in-flight invoice requests
  }, [])

  /** useEffects */

  // on order id change - update cache immutably
  useEffect(() => {
    if (!orderId) {
      return
    }
    const order = paymentsCache[orderId]
    if (!order) return
    const updatedIsPaid = order.isPaid || isPaid
    const updatedIsPrinted = order.isPrinted || isPrinted
    // Only update if values actually changed
    if (updatedIsPaid !== order.isPaid || updatedIsPrinted !== order.isPrinted) {
      setPaymentsCache({
        ...paymentsCache,
        [orderId]: {
          ...order,
          isPaid: updatedIsPaid,
          isPrinted: updatedIsPrinted
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, isPaid, isPrinted])

  // Subscribe for zaps
  useEffect(() => {
    if (!orderId || !zapEmitterPubKey || isPaid || subZap) {
      return
    }

    console.info(`Subscribing for ${orderId}...`)

    const sub = subscribeZap!(orderId)
    setSubZap(sub)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, zapEmitterPubKey, isPaid])

  // On subZap change - manage listener lifecycle
  useEffect(() => {
    if (!subZap) {
      return
    }
    subZap.on('event', onZap)
    subZap.start()
    return () => {
      console.info('Unsubscribing for zap...')
      subZap.removeAllListeners()
      subZap.stop()
      setSubZap(undefined)
    }
  }, [subZap, onZap])

  // On orderId change — request invoice
  // Use a ref to track the current request and prevent stale responses
  // from overwriting the current invoice (race condition)
  const invoiceRequestIdRef = useRef(0)
  useEffect(() => {
    if (!orderId || !zapEmitterPubKey || amount === 0) {
      return
    }

    // Clear stale invoice immediately so QR doesn't show old one
    setCurrentInvoice(undefined)
    setLUD21(undefined)

    // Increment request ID to invalidate any in-flight requests
    const requestId = ++invoiceRequestIdRef.current

    requestZapInvoice!(amount * 1000, orderId)
      .then(_invoice => {
        // Only update state if this is still the current request
        if (requestId !== invoiceRequestIdRef.current) {
          console.warn('Ignoring stale invoice response (superseded by newer request)')
          return
        }
        setLUD21(_invoice.verify)
        setCurrentInvoice(_invoice.pr)
      })
      .catch((e: Error) => {
        if (requestId !== invoiceRequestIdRef.current) return
        setError(`Couldn't generate invoice. ${e.cause}`)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, orderId, zapEmitterPubKey])

  const handleResubscription = useCallback(
    (relay: NDKRelay) => {
      if (relay && subZap && filter) {
        relay.subscribe(subZap, [JSON.parse(filter)])
      }
    },
    [subZap, filter]
  )

  useEffect(() => {
    ndk.pool.on('relay:connect', handleResubscription)

    return () => {
      ndk.pool.off('relay:connect', handleResubscription)
    }
  }, [handleResubscription, ndk.pool])

  useEffect(() => {
    if (lud21Paid && !isPaidRef.current) {
      setIsPaid(true)
    }
  }, [lud21Paid])

  return (
    <OrderContext.Provider
      value={{
        orderId,
        amount,
        fiatAmount,
        fiatCurrency,
        currentInvoice,
        memo,
        products,
        isPaid,
        isPrinted,
        orderEvent,
        paymentsCache,
        error,
        isCheckEmergencyEvent,
        handleEmergency,
        setCheckEmergencyEvent,
        loadOrder,
        setIsPrinted,
        setIsPaid,
        setProducts,
        clear,
        setMemo,
        checkOut,
        setAmount,
        setFiatAmount,
        requestZapInvoice,
        generateOrderEvent,
        setOrderEvent
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

// Export hook
export const useOrder = () => {
  return useContext(OrderContext)
}
