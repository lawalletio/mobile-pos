// React/Next
import { createContext } from 'react'

// Context and Hooks
import useConfiguration, { ConfigReturns } from '@/hooks/useConfiguration'

interface LaWalletContextType {
  userConfig: ConfigReturns
}

export const LaWalletContext = createContext({} as LaWalletContextType)

export function LaWalletProvider({ children }: { children: React.ReactNode }) {
  const userConfig: ConfigReturns = useConfiguration()

  const value = {
    userConfig
  }

  return (
    <LaWalletContext.Provider value={value}>
      {children}
    </LaWalletContext.Provider>
  )
}
