// React
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

// Contexts and Hooks
import { useLN } from './LN'
import { useLocalStorage } from 'react-use-storage'
import { LaWalletContext } from './LaWalletContext'

// Constants
import proxyLud06Raw from '@/constants/lud06/proxy.json'
const LEDGER_PUBKEY = process.env.NEXT_PUBLIC_LEDGER_PUBKEY!

// Types
import { LNURLResponse } from '@/types/lnurl'

// Utils
import { finalizeEvent, getPublicKey, UnsignedEvent } from 'nostr-tools'
import { hexToBytes } from '@noble/hashes/utils'
import axios, { AxiosResponse } from 'axios'

export interface IProxyContext {
  isEnabled?: boolean
  proxyPrivateKey?: string
  transfer: (
    amountMilliSats: number,
    destination?: LNURLResponse
  ) => Promise<AxiosResponse<any, any>>
  enableProxy: () => void
  disableProxy: () => void
  setProxyPrivateKey: (privateKey: string) => void
}

export const ProxyContext = createContext<IProxyContext>({
  isEnabled: false,
  proxyPrivateKey: '',
  enableProxy: () => {},
  disableProxy: () => {},
  transfer: (_amountMilliSats: number, _destination?: LNURLResponse) =>
    Promise.resolve({} as AxiosResponse),
  setProxyPrivateKey: (_privateKey: string) => {}
})

export const ProxyProvider = ({ children }: { children: React.ReactNode }) => {
  const { setLUD06 } = useLN()
  const { destinationLUD06 } = useContext(LaWalletContext)
  const [proxyLud06, setProxyLud06] = useState<LNURLResponse | null>(null)
  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>('proxy', false)
  const [proxyPrivateKey, setProxyPrivateKey] = useState(
    '8bc45bb460c419a2393002cc8dfe34e8336cb944e715d4677418df0c3651d8ee'
  )

  const enableProxy = useCallback(() => {
    console.info('enableProxy')
    console.dir(proxyLud06)
    if (!proxyLud06) {
      throw new Error('Proxy LUD06 not found')
    }
    setIsEnabled(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyLud06])

  const disableProxy = useCallback(() => {
    setIsEnabled(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const transfer = useCallback(
    async (
      amountMilliSats: number,
      destination: LNURLResponse | null = destinationLUD06
    ) => {
      if (!proxyLud06) {
        throw new Error('Proxy LUD06 not found')
      }

      if (!destination) {
        throw new Error('No destination found')
      }

      const url = `${destination.callback}?amount=${amountMilliSats}`
      const {
        data: { pr }
      } = await axios.get(url)
      // pr is an invoice
      const unsignedEvent = {
        kind: 1112,
        pubkey: getPublicKey(hexToBytes(proxyPrivateKey)),
        created_at: Math.round(Date.now() / 1000),
        tags: [
          ['t', 'internal-transaction-start'],
          ['p', LEDGER_PUBKEY],
          ['p', proxyLud06Raw.nostrPubkey],
          ['bolt11', pr]
        ],
        content: JSON.stringify({
          tokens: {
            BTC: amountMilliSats
          }
        })
      } as UnsignedEvent

      const signedEvent = finalizeEvent(
        unsignedEvent,
        hexToBytes(proxyPrivateKey)
      )

      const res = await axios.post(
        `https://api.lawallet.ar/nostr/publish`,
        signedEvent,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      console.info('res')
      console.dir(res)
      return res
    },
    [destinationLUD06, proxyLud06, proxyPrivateKey]
  )

  // on proxyPrivateKey change
  useEffect(() => {
    const publicKey = getPublicKey(hexToBytes(proxyPrivateKey))
    setProxyLud06({
      ...proxyLud06Raw,
      callback: proxyLud06Raw.callback.replace('{PUBLIC_KEY}', publicKey),
      accountPubKey: proxyLud06Raw.accountPubKey.replace(
        '{PUBLIC_KEY}',
        publicKey
      )
    })
  }, [proxyPrivateKey])

  useEffect(() => {
    console.info('destinationLUD06', destinationLUD06)
    if (!destinationLUD06) {
      return
    }

    if (isEnabled) {
      setLUD06(proxyLud06!)
    } else {
      if (destinationLUD06.allowsNostr) {
        setLUD06(destinationLUD06)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationLUD06, isEnabled, proxyLud06])

  return (
    <ProxyContext.Provider
      value={{
        isEnabled,
        proxyPrivateKey,
        setProxyPrivateKey,
        enableProxy,
        disableProxy,
        transfer
      }}
    >
      {children}
    </ProxyContext.Provider>
  )
}

// Hook
export const useProxy = () => {
  return useContext(ProxyContext)
}
