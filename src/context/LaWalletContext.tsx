// React/Next
import { createContext } from 'react'

// Context and Hooks
import useConfiguration, { ConfigReturns } from '@/hooks/useConfiguration'
import { useLocalStorage } from 'react-use-storage'
import { LNURLResponse } from '@/types/lnurl'

interface LaWalletContextType {
  userConfig: ConfigReturns
  destinationLUD06: LNURLResponse
  setDestinationLUD06: (value: LNURLResponse) => void
}

// Constants
export const LaWalletContext = createContext({} as LaWalletContextType)

export function LaWalletProvider({ children }: { children: React.ReactNode }) {
  const userConfig: ConfigReturns = useConfiguration()
  const [destinationLUD06, setDestinationLUD06] =
    useLocalStorage<LNURLResponse>('destinationLUD06')

  const value: LaWalletContextType = {
    userConfig,
    destinationLUD06,
    setDestinationLUD06
  }

  return (
    <LaWalletContext.Provider value={value}>
      {children}
    </LaWalletContext.Provider>
  )
}
