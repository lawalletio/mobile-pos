'use client'

// React
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

// Interface
export interface ILNContext {
  zapEmitterPubKey?: string
  callbackUrl?: string
  destination?: string
  requestInvoice?: (_req: InvoiceRequest) => Promise<string>
}

import { requestPayServiceParams } from 'lnurl-pay'
import axios from 'axios'
import type { InvoiceRequest } from '@/types/lightning'

// Context
export const LNContext = createContext<ILNContext>({})

// Component Props
interface ILNProviderProps {
  children: React.ReactNode
}

const DESTINATION_LNURL = process.env.NEXT_PUBLIC_DESTINATION!

export const LNProvider = ({ children }: ILNProviderProps) => {
  const [zapEmitterPubKey, setZapEmitterPubKey] = useState<string>()
  const [callbackUrl, setCallbackUrl] = useState<string>()

  const fetchLNURL = useCallback(async () => {
    console.info('FETCHING LNURL')
    const lud06 = await requestPayServiceParams({
      lnUrlOrAddress: DESTINATION_LNURL
    })

    console.info('lud06:')
    console.dir(lud06)

    // TODO: Check if lud06 is valid
    setZapEmitterPubKey(lud06.rawData.nostrPubkey as string)
    setCallbackUrl(lud06.callback)
  }, [])

  const requestInvoice = useCallback(
    async ({ amountMillisats, zapEvent }: InvoiceRequest): Promise<string> => {
      const encodedZapEvent = encodeURI(JSON.stringify(zapEvent))
      const url = `${callbackUrl}?amount=${amountMillisats}&nostr=${encodedZapEvent}&lnurl=${DESTINATION_LNURL}`
      console.info('url')
      console.dir(url)
      const response = await axios.get(url)
      return response.data.pr as string
    },
    [callbackUrl]
  )

  useEffect(() => {
    void fetchLNURL()
  }, [fetchLNURL])

  return (
    <LNContext.Provider
      value={{
        zapEmitterPubKey,
        callbackUrl,
        destination: DESTINATION_LNURL,
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
