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
import type { NDKEvent, NostrEvent } from '@nostr-dev-kit/ndk'

// Utils
import { useNostr } from './Nostr'
import { parseOrderDescription, parseZapInvoice } from '@/lib/utils'
import { getEventHash, getSignature, nip44, validateEvent } from 'nostr-tools'
import bolt11 from 'bolt11'

// Interface
export interface IOrderContext {
  orderId?: string
  amount: number
  pendingAmount: number
  fiatAmount: number
  fiatCurrency?: string
  zapEvents: NostrEvent[]
  currentInvoice?: string
  memo: unknown
  clear: () => void
  setMemo: Dispatch<SetStateAction<unknown>>
  setAmount: Dispatch<SetStateAction<number>>
  checkOut: () => Promise<{ eventId: string }>
  setCurrentInvoice?: Dispatch<SetStateAction<string | undefined>>
  setOrderEvent?: Dispatch<SetStateAction<Event | undefined>>
  generateOrderEvent?: () => Event
  setFiatAmount: Dispatch<SetStateAction<number>>
  addZapEvent?: (event: NDKEvent) => void
  requestZapInvoice?: (
    amountMillisats: number,
    orderEventId: string
  ) => Promise<string>
}

// Context
export const OrderContext = createContext<IOrderContext>({
  amount: 0,
  pendingAmount: 0,
  fiatAmount: 0,
  zapEvents: [],
  fiatCurrency: 'ARS',
  checkOut: function (): Promise<{ eventId: string }> {
    throw new Error('Function not implemented.')
  },
  setAmount: function (): void {
    throw new Error('Function not implemented.')
  },
  setFiatAmount: function (): void {
    throw new Error('Function not implemented.')
  },
  memo: undefined,
  setMemo: function (_value: unknown): void {
    throw new Error('Function not implemented.')
  },
  clear: function (): void {
    throw new Error('Function not implemented.')
  }
})

// Component Props
interface IOrderProviderProps {
  children: React.ReactNode
}

const NEXT_PUBLIC_ENCRYPT_PUBLIC_KEY = process.env
  .NEXT_PUBLIC_ENCRYPT_PUBLIC_KEY as string

export const OrderProvider = ({ children }: IOrderProviderProps) => {
  const [orderId, setOrderId] = useState<string>()
  const [orderEvent, setOrderEvent] = useState<Event>()
  const [amount, setAmount] = useState<number>(0)
  const [memo, setMemo] = useState<unknown>({})
  const [currentInvoice, setCurrentInvoice] = useState<string>()
  const [pendingAmount, setPendingAmount] = useState<number>(0)
  const [fiatAmount, setFiatAmount] = useState<number>(0)
  const [fiatCurrency, setFiatCurrency] = useState<string>('ARS')
  const [zapEvents, setZapEvents] = useState<NostrEvent[]>([])

  const { relays, localPublicKey, localPrivateKey, generateZapEvent } =
    useNostr()
  const { requestInvoice, zapEmitterPubKey } = useLN()
  const { subscribeZap, publish } = useNostr()

  // on orderEvent change
  useEffect(() => {
    if (!orderEvent) {
      setOrderId(undefined)
      setAmount(0)
      setPendingAmount(0)
      setFiatAmount(0)
      setFiatCurrency('ARS')
      return
    }

    const description = parseOrderDescription(orderEvent as Event)

    setOrderId(orderEvent.id)
    setAmount(description.amount)
    setPendingAmount(description.amount)
    // setFiatAmount(description.fiatAmount)
    // setFiatCurrency(description.fiatCurrency)
  }, [orderEvent])

  // Subscribe for zaps
  useEffect(() => {
    if (!orderId || !zapEmitterPubKey) {
      return
    }

    console.info(`Subscribing for ${orderId}...`)
    const sub = subscribeZap!(orderId)

    sub.addListener('event', onZap)

    return () => {
      sub.removeAllListeners()
      sub.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, zapEmitterPubKey, zapEmitterPubKey])

  nip44.decrypt
  const generateOrderEvent = useCallback((): Event => {
    const vote = (memo as any).vote as number

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
            amount,
            vote
          })
        ]
      ] as string[][]
    }

    const event: Event = {
      id: getEventHash(unsignedEvent),
      sig: getSignature(unsignedEvent, localPrivateKey!),
      ...unsignedEvent
    }

    console.info('event:')
    console.dir(event)

    return event
  }, [amount, localPrivateKey, localPublicKey, relays, memo])

  // Checkout function
  const checkOut = useCallback(async (): Promise<{
    eventId: string
  }> => {
    // Order Nostr event
    const order = generateOrderEvent()
    await publish!(order)

    return { eventId: order.id }
  }, [generateOrderEvent, publish])

  const addZapEvent = useCallback(async (event: NDKEvent) => {
    const invoice = parseZapInvoice(event as Event)
    if (!invoice.complete) {
      console.info('Incomplete invoice')
      return
    }
    const amountPaid = parseInt(invoice.millisatoshis!) / 1000
    setPendingAmount(prev => prev - amountPaid)
    const _event = await event.toNostrEvent()
    setZapEvents(prev => [...prev, _event])
  }, [])

  const requestZapInvoice = useCallback(
    async (amountMillisats: number, orderEventId: string): Promise<string> => {
      // Generate ZapRequestEvent
      const zapEvent = generateZapEvent!(amountMillisats, orderEventId)

      console.info('zapEvent')
      console.dir(zapEvent)

      // Request new invoice
      const invoice = await requestInvoice!({
        amountMillisats,
        zapEvent: (await zapEvent.toNostrEvent()) as Event
      })

      return invoice
    },
    [generateZapEvent, requestInvoice]
  )

  const clear = () => {
    setAmount(0)
    setOrderId(undefined)
    setOrderEvent(undefined)
    setMemo({})
    setFiatAmount(0)
    setZapEvents([])
  }

  // Handle new incoming zap
  const onZap = (event: NDKEvent) => {
    if (event.pubkey !== zapEmitterPubKey) {
      throw new Error('Invalid Recipient Pubkey')
    }

    if (!validateEvent(event)) {
      throw new Error('Invalid event')
    }

    const paidInvoice = event.tags.find(tag => tag[0] === 'bolt11')?.[1]
    const decodedPaidInvoice = bolt11.decode(paidInvoice!)

    addZapEvent(event)
    console.info('Amount paid : ' + decodedPaidInvoice.millisatoshis)
  }

  return (
    <OrderContext.Provider
      value={{
        orderId,
        zapEvents,
        amount,
        fiatAmount,
        fiatCurrency,
        pendingAmount,
        currentInvoice,
        memo,
        clear,
        setMemo,
        checkOut,
        setAmount,
        setFiatAmount,
        setCurrentInvoice,
        requestZapInvoice,
        generateOrderEvent,
        setOrderEvent,
        addZapEvent
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
