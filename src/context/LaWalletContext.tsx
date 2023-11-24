// React/Next
import { createContext } from 'react'

// Context and Hooks
import useConfiguration, { ConfigReturns } from '@/hooks/useConfiguration'
import { useLocalStorage } from 'react-use-storage'

interface LaWalletContextType {
  userConfig: ConfigReturns
  destionationLUD06: string
  setDestionationLUD06: (value: string) => void
}

// Constants
export const LaWalletContext = createContext({} as LaWalletContextType)

export function LaWalletProvider({ children }: { children: React.ReactNode }) {
  const userConfig: ConfigReturns = useConfiguration()
  const [destionationLUD06, setDestionationLUD06] =
    useLocalStorage<string>('destionationLUD06')

  const value: LaWalletContextType = {
    userConfig,
    destionationLUD06,
    setDestionationLUD06
  }

  return (
    <LaWalletContext.Provider value={value}>
      {children}
    </LaWalletContext.Provider>
  )
}
