'use client'

// React
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

// Types
import type { InvoiceRequest } from '@/types/lightning'

// Utils
import axios from 'axios'
import { LNURLInvoiceResponse, LNURLResponse } from '@/types/lnurl'

// Interface
export interface ILNContext {
  zapEmitterPubKey?: string
  callbackUrl?: string
  destinationPubKey?: string
  isReady?: boolean
  lud06?: LNURLResponse
  setLUD06: Dispatch<SetStateAction<LNURLResponse | undefined>>
  clear: () => void
  setAccountPubKey: (_pubKey: string) => void
  requestInvoice: (_req: InvoiceRequest) => Promise<LNURLInvoiceResponse>
}

// Context
export const LNContext = createContext<ILNContext>({
  requestInvoice: function (
    _req: InvoiceRequest
  ): Promise<LNURLInvoiceResponse> {
    throw new Error('Function not implemented.')
  },
  setAccountPubKey: function (_pubKey: string): void {
    throw new Error('Function not implemented.')
  },
  clear: function (): void {
    throw new Error('Function not implemented.')
  },
  setLUD06: function (value: SetStateAction<LNURLResponse | undefined>): void {
    throw new Error('Function not implemented.')
  }
})

// Component Props
interface ILNProviderProps {
  children: React.ReactNode
}

export const LNProvider = ({ children }: ILNProviderProps) => {
  // Local state
  const [zapEmitterPubKey, setZapEmitterPubKey] = useState<string>()
  const [callbackUrl, setCallbackUrl] = useState<string>()
  const [destinationPubKey, setDestinationPubKey] = useState<string>()
  const [isReady, setIsReady] = useState<boolean>(false)
  const [lud06, setLUD06] = useState<LNURLResponse>()

  /** Functions */

  const setAccountPubKey = useCallback((pubkey: string) => {
    setDestinationPubKey(pubkey)
    setCallbackUrl(pubkey)
    setIsReady(true)
  }, [])

  const requestInvoice = useCallback(
    async ({
      amountMillisats,
      zapEvent
    }: InvoiceRequest): Promise<LNURLInvoiceResponse> => {
      const encodedZapEvent = encodeURI(JSON.stringify(zapEvent))
      const url = `${callbackUrl}?amount=${amountMillisats}&nostr=${encodedZapEvent}&lnurl=${destinationPubKey}`
      console.info('url')
      console.dir(url)
      const response = await axios.get(url)
      return response.data
    },
    [callbackUrl, destinationPubKey]
  )

  const clear = useCallback((): void => {
    console.info('CLEAR LN')
    setLUD06(undefined)
    setZapEmitterPubKey(undefined)
    setCallbackUrl(undefined)
    setDestinationPubKey(undefined)
    setIsReady(false)
  }, [])

  // on lud06 change
  useEffect(() => {
    if (!lud06) {
      return
    }

    if (!lud06.allowsNostr || !lud06.nostrPubkey) {
      console.warn('LNURL does not allow nostr')
      alert('LNURL does not allow nostr')
      return
    }

    setZapEmitterPubKey(lud06.nostrPubkey)
    setCallbackUrl(lud06.callback)
    setDestinationPubKey(lud06.accountPubKey)
    setIsReady(true)
  }, [lud06])

  return (
    <LNContext.Provider
      value={{
        zapEmitterPubKey,
        callbackUrl,
        destinationPubKey,
        isReady,
        lud06,
        setLUD06,
        clear,
        setAccountPubKey,
        requestInvoice
      }}
    >
      {children}
    </LNContext.Provider>
  )
}

// Export hook
export const useLN = () => {
  return useContext(LNContext)
}
