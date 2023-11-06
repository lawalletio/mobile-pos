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
import { requestPayServiceParams } from 'lnurl-pay'
import { isValidUrl } from '@/lib/utils'

// Interface
export interface ILNContext {
  zapEmitterPubKey?: string
  callbackUrl?: string
  destination?: string
  destinationPubKey?: string
  destinationLNURL?: string
  setAccountPubKey: (_pubKey: string) => void
  setZapEmitterPubKey: (_pubKey: string) => void
  setCallbackUrl: (_url: string) => void
  setDestinationLNURL: Dispatch<SetStateAction<string | undefined>>
  requestInvoice: (_req: InvoiceRequest) => Promise<string>
}

const DESTINATION_LNURL = process.env.NEXT_PUBLIC_DESTINATION!

// Context
export const LNContext = createContext<ILNContext>({
  requestInvoice: function (_req: InvoiceRequest): Promise<string> {
    throw new Error('Function not implemented.')
  },
  setZapEmitterPubKey: function (_pubKey: string): void {
    throw new Error('Function not implemented.')
  },
  setCallbackUrl: function (_url: string): void {
    throw new Error('Function not implemented.')
  },
  setDestinationLNURL: function (
    value: SetStateAction<string | undefined>
  ): void {
    throw new Error('Function not implemented.')
  },
  setAccountPubKey: function (_pubKey: string): void {
    throw new Error('Function not implemented.')
  }
})

// Component Props
interface ILNProviderProps {
  children: React.ReactNode
}

const IDENTITY_PROVIDER_URL = process.env.NEXT_PUBLIC_IDENTITY_PROVIDER_URL!

export const LNProvider = ({ children }: ILNProviderProps) => {
  // Local state
  const [zapEmitterPubKey, setZapEmitterPubKey] = useState<string>()
  const [callbackUrl, setCallbackUrl] = useState<string>()
  const [destinationPubKey, setDestinationPubKey] = useState<string>()
  const [destinationLNURL, setDestinationLNURL] = useState<string>()

  /** Functions */
  const fetchLNURL = useCallback(async (lnurl: string) => {
    let lud06
    console.info(`Fetching LNURL: ${lnurl}`)
    if (isValidUrl(lnurl)) {
      console.info('Going for regular https')
      const response = await axios.get(lnurl)
      lud06 = {
        ...response.data,
        rawData: response.data
      }
    } else {
      console.info('Going for LNURL')
      lud06 = await requestPayServiceParams({
        lnUrlOrAddress: lnurl
      })
    }

    console.info('LUD06 response:')
    console.dir(lud06)

    // TODO: Check if lud06 is valid
    setZapEmitterPubKey(lud06.rawData.nostrPubkey as string)
    setDestinationPubKey(lud06.rawData.accountPubKey as string)
    setCallbackUrl(lud06.callback)
  }, [])

  const setAccountPubKey = (pubkey: string) => {
    setDestinationPubKey(pubkey)
    setCallbackUrl(pubkey)
    setDestinationLNURL(`${IDENTITY_PROVIDER_URL}/api/lud06/${pubkey}`)
  }

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
    if (!destinationLNURL) {
      setZapEmitterPubKey(undefined)
      setCallbackUrl(undefined)
      return
    }
    if (destinationPubKey) {
      return
    }
    fetchLNURL(destinationLNURL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationLNURL, destinationPubKey])

  return (
    <LNContext.Provider
      value={{
        zapEmitterPubKey,
        callbackUrl,
        destinationPubKey,
        destination: DESTINATION_LNURL,
        destinationLNURL,
        setAccountPubKey,
        setZapEmitterPubKey,
        setCallbackUrl,
        setDestinationLNURL,
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
