'use client'

// React
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

// Constants
const NOSTR_API_URL = 'https://api.lawallet.ar/nostr/fetch'

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
  // Hooks
  const { relays, localPublicKey, localPrivateKey, generateZapEvent } =
    useNostr()
  const { lud06, zapEmitterPubKey, requestInvoice, setLUD06 } = useLN()
  const { ndk, filter, subscribeZap, publish } = useNostr()

  // Local states
  const [subZap, setSubZap] = useState<NDKSubscription | undefined>(undefined)
  const [orderId, setOrderId] = useState<string>()
  const [isPaid, setIsPaid] = useState<boolean>(false)
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

    paymentsCache[payment.id] = payment
    setPaymentsCache(paymentsCache)

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

  const handleEmergency = async () => {
    console.dir('[EMERGENCY] handleEmergency in Order.tsx')
    // Fetch Options
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: filter
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

      // Force fetch event
      console.info('Feching event from relays')
      const event = await ndk.fetchEvent(JSON.parse(filter!))
      console.dir(event)
      if (event) {
        onZap(event)
        return
      }
    } catch (err) {
      console.error('Error en fetch:', err)
    } finally {
      setCheckEmergencyEvent(false)
    }
  }

  // Handle new incoming zap
  const onZap = (event: NDKEvent) => {
    console.info('onZap in Order.tsx')
    console.dir(event)
    if (event.pubkey !== zapEmitterPubKey) {
      throw new Error('Invalid Recipient Pubkey')
    }

    if (!validateEvent(event)) {
      throw new Error('Invalid event')
    }

    const paidInvoice = event.tags.find(tag => tag[0] === 'bolt11')?.[1]
    const decodedPaidInvoice = bolt11.decode(paidInvoice!)

    handlePaymentReceived(event)
    console.info('Amount paid : ' + decodedPaidInvoice.millisatoshis)
  }

  const clear = useCallback(() => {
    setOrderId(undefined)
    setOrderEvent(undefined)
    setAmount(0)
    setFiatAmount(0)
    setIsPaid(false)
    setCurrentInvoice(undefined)
    setIsPrinted(false)
    setProducts([])
    setMemo({})
    setError(undefined)
    setCheckEmergencyEvent(false)
    setSubZap(undefined)
  }, [])

  /** useEffects */

  // on order id change
  useEffect(() => {
    if (!orderId) {
      return
    }
    const order = paymentsCache[orderId]
    // Prevent order from updating to false
    paymentsCache[orderId] = {
      ...order,
      isPaid: order.isPaid || isPaid,
      isPrinted: order.isPrinted || isPrinted
    }
    setPaymentsCache(paymentsCache)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, isPaid, isPrinted, paymentsCache])

  // Subscribe for zaps
  useEffect(() => {
    if (!orderId || !zapEmitterPubKey || isPaid || subZap) {
      return
    }

    console.info(`Subscribing for ${orderId}...`)

    const sub = subscribeZap!(orderId)
    setSubZap(sub)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, zapEmitterPubKey, zapEmitterPubKey, isPaid])

  // On subZap change
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subZap])

  // On orderId change
  useEffect(() => {
    if (!orderId || !zapEmitterPubKey || amount === 0) {
      return
    }

    requestZapInvoice!(amount * 1000, orderId)
      .then(_invoice => {
        setLUD21(_invoice.verify)
        setCurrentInvoice!(_invoice.pr)
      })
      .catch((e: Error) => {
        setError(`Couldn't generate invoice. ${e.cause}`)
      })
  }, [amount, orderId, zapEmitterPubKey, requestZapInvoice])

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
