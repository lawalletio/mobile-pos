// React/Next
import { createContext } from 'react'

// Context and Hooks
import useConfiguration, { ConfigReturns } from '@/hooks/useConfiguration'
import { LNURLResponse } from '@/types/lnurl'
import { useLocalStorage } from 'react-use-storage'

type DestinationType = {
  lud06: LNURLResponse | null
  lud16: string | null
}

interface LaWalletContextType {
  userConfig: ConfigReturns
  destination: DestinationType
  setDestination: (value: DestinationType) => void
}

export const LaWalletContext = createContext({} as LaWalletContextType)

export function LaWalletProvider({ children }: { children: React.ReactNode }) {
  const userConfig: ConfigReturns = useConfiguration()
  const [destination, setDestination] =
    useLocalStorage<DestinationType>('destination')

  const value = {
    userConfig,
    destination,
    setDestination
  }

  return (
    <LaWalletContext.Provider value={value}>
      {children}
    </LaWalletContext.Provider>
  )
}
