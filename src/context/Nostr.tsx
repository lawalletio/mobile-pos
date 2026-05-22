'use client'

// React
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

// Types
import type { Event, UnsignedEvent } from 'nostr-tools'

// Utils
import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip19
} from 'nostr-tools'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { useLocalStorage } from 'react-use-storage'

// Hooks
import { useLN } from './LN'

// Interfaces
export interface INostrContext {
  localPublicKey?: string
  localPrivateKey?: string
  relays?: string[]
  ndk: NDK
  filter?: string
  getBalance: (pubkey: string) => Promise<number>
  resolveNip05?: (
    nip05: string
  ) => Promise<{ npub: string; pubkey: string; relays?: string[] } | undefined>
  generateZapEvent?: (
    amountMillisats: number,
    postEventId?: string,
    recipientPubkey?: string
  ) => NDKEvent
  subscribeZap?: (eventId: string) => NDKSubscription
  getEvent?: (eventId: string) => Promise<NDKEvent | null>
  publish?: (_event: Event) => Promise<Set<NDKRelay>>
}

const NOSTR_RELAY = process.env.NEXT_PUBLIC_NOSTR_RELAY!
const LEDGER_PUBKEY = process.env.NEXT_PUBLIC_LEDGER_PUBKEY!

export const DEFAULT_NOSTR_RELAYS = [
  NOSTR_RELAY,
  'wss://relay.damus.io',
  'wss://nostr-pub.wellorder.net'
].filter(Boolean)

export const SUGGESTED_NOSTR_RELAYS = [
  ...DEFAULT_NOSTR_RELAYS,
  'wss://nos.lol',
  'wss://nostr.wine',
  'wss://relay.nostr.band',
  'wss://relay.wellorder.net',
  'wss://nostr.mom',
  'wss://relay.primal.net',
  'wss://relay.masize.com'
]

export const REQUIRED_NOSTR_RELAY_COUNT = 2

export function cleanRelays(relays: string[]): string[] {
  return Array.from(
    new Set(
      relays
        .map(relay => relay.trim())
        .filter(Boolean)
        .map(relay => (relay.startsWith('wss://') ? relay : `wss://${relay}`))
        .map(relay => relay.replace(/\/+$/, ''))
    )
  )
}

// Context
const ndk = new NDK({
  explicitRelayUrls: DEFAULT_NOSTR_RELAYS
})

export const NostrContext = createContext<INostrContext>({
  ndk,
  getBalance: function (pubkey: string): Promise<number> {
    throw new Error('Function not implemented.')
  }
})

// Component Props
interface INostrProviderProps {
  children: React.ReactNode
}

import NDK, {
  NDKEvent,
  NDKKind,
  NDKRelaySet,
  NDKSubscription,
  type NDKRelay
} from '@nostr-dev-kit/ndk'

export const NostrProvider = ({ children }: INostrProviderProps) => {
  const { zapEmitterPubKey } = useLN()
  const [privateKey] = useLocalStorage(
    'nostrPrivateKey',
    bytesToHex(generateSecretKey())
  )
  const [storedRelays] = useLocalStorage<string[]>(
    'nostrRelays',
    DEFAULT_NOSTR_RELAYS
  )
  const [publicKey, setPublicKey] = useState<string>()
  const [filter, setFilter] = useState<string>()
  const relays = useMemo(() => {
    const cleanedRelays = cleanRelays(storedRelays)
    return cleanedRelays.length > 0 ? cleanedRelays : DEFAULT_NOSTR_RELAYS
  }, [storedRelays])
  const requiredRelayCount = Math.min(REQUIRED_NOSTR_RELAY_COUNT, relays.length)
  const getRelaySet = useCallback(
    () => NDKRelaySet.fromRelayUrls(relays, ndk),
    [relays]
  )

  /** Functions */
  const resolveNip05 = useCallback(
    async (nip05: string) => {
      const user = await ndk.getUserFromNip05(nip05, true)
      if (!user?.pubkey) {
        return undefined
      }

      return {
        npub: nip19.npubEncode(user.pubkey),
        pubkey: user.pubkey,
        relays: user.relayUrls
      }
    },
    []
  )

  const generateZapEvent = useCallback(
    (
      amountMillisats: number,
      postEventId?: string,
      recipientPubkey = zapEmitterPubKey
    ): NDKEvent => {
      const unsignedEvent: UnsignedEvent = {
        kind: 9734,
        content: '',
        pubkey: publicKey!,
        created_at: Math.round(Date.now() / 1000),
        tags: [
          ['relays', ...relays],
          ['amount', amountMillisats.toString()],
          ['lnurl', 'lnurl'],
          ['p', recipientPubkey]
        ] as string[][]
      }

      postEventId && unsignedEvent.tags.push(['e', postEventId, relays[0]])

      const event = new NDKEvent(
        ndk,
        finalizeEvent(unsignedEvent, hexToBytes(privateKey))
      )

      console.info('zap event: ')
      console.dir(event)

      return event
    },
    [zapEmitterPubKey, privateKey, publicKey, relays]
  )

  const getBalance = async (pubkey: string): Promise<number> => {
    const balance = await ndk.fetchEvent(
      {
        authors: [LEDGER_PUBKEY!],
        kinds: [31111 as NDKKind],
        '#d': [`balance:BTC:${pubkey}`]
      },
      undefined,
      getRelaySet()
    )

    if (!balance) {
      return 0
    }
    return (parseInt(balance.tagValue('amount')!) as number) / 1000
  }

  /** Subscriptions */
  const subscribeZap = (eventId: string): NDKSubscription => {
    console.info(`Listening for zap (${eventId})...`)
    console.info(`Recipient pubkey: ${zapEmitterPubKey}`)

    const zapFilters = {
      kinds: [9735],
      authors: [zapEmitterPubKey!],
      '#e': [eventId],
      since: Math.floor(new Date().getTime() / 1000)
    }

    setFilter(JSON.stringify(zapFilters))

    return ndk.subscribe(zapFilters, { closeOnEose: false }, getRelaySet())
  }

  const getEvent = async (eventId: string): Promise<NDKEvent | null> => {
    return ndk.fetchEvent(
      {
        ids: [eventId]
      },
      undefined,
      getRelaySet()
    )
  }

  const publish = async (event: Event): Promise<Set<NDKRelay>> => {
    const ndkEvent = new NDKEvent(ndk, event)
    return ndkEvent.publish(getRelaySet(), 5000, requiredRelayCount)
  }

  /** useEffects */

  useEffect(() => {
    console.info('Connecting....')
    void ndk.connect().then(() => {
      console.info('Connected')
    })

    return () => {
      console.info('Unsubscribed')
      // relayPool.close()
    }
  }, [])

  useEffect(() => {
    // Generate Public key
    const _publicKey = getPublicKey(hexToBytes(privateKey))

    setPublicKey(_publicKey)
  }, [privateKey])

  return (
    <NostrContext.Provider
      value={{
        localPublicKey: publicKey,
        localPrivateKey: privateKey,
        relays,
        ndk,
        filter,
        getBalance,
        resolveNip05,
        generateZapEvent,
        subscribeZap,
        getEvent,
        publish
      }}
    >
      {children}
    </NostrContext.Provider>
  )
}

// Export hook
export const useNostr = () => {
  return useContext(NostrContext)
}
