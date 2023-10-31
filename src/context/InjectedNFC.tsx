import { createContext } from 'react'

// Interface
export interface InjectedNFCContext {
  subscribe: () => Promise<string>
}

// Context
export const InjectedNFCContext = createContext<InjectedNFCContext>({
  subscribe: function (): Promise<string> {
    throw new Error('Function not implemented.')
  }
})

interface InjectedNFCProviderProps {
  children: React.ReactNode
}

export const InjectedNFCProvider = ({ children }: InjectedNFCProviderProps) => {
  const subscribe = async () => {
    return Promise.resolve('hello')
  }

  return (
    <InjectedNFCContext.Provider value={{ subscribe }}>
      {children}
    </InjectedNFCContext.Provider>
  )
}
