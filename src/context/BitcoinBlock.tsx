// React
import { createContext, useContext, useEffect, useState } from 'react'

export interface IBitcoinBlockContext {
  lastBlockNumber: number
  refresh: () => void
}

export const BitcoinBlockContext = createContext<IBitcoinBlockContext>({
  lastBlockNumber: 0,
  refresh: () => {}
})

export const BitcoinBlockProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [lastBlockNumber, setLastBlockNumber] = useState(111111)

  const refresh = async () => {
    const lastBlockNumber = await getLastBlockNumber()
    setLastBlockNumber(lastBlockNumber)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <BitcoinBlockContext.Provider value={{ lastBlockNumber, refresh }}>
      {children}
    </BitcoinBlockContext.Provider>
  )
}

export const useBitcoinBlock = () => {
  return useContext(BitcoinBlockContext)
}

async function getLastBlockNumber() {
  // get lastblock from mempool api
  const response = await fetch(
    'https://mempool.masize.com/api/v1/blocks/tip/height'
  )
  return await response.json()
}
