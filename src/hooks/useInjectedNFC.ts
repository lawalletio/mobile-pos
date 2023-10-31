import { InjectedNFCContext } from '@/context/InjectedNFC'
import { useCallback, useContext, useEffect, useState } from 'react'

interface PrintReturns {
  isAvailable: boolean
  read: () => Promise<string>
  abortReadCtrl: () => void
}

export const useInjectedNFC = (): PrintReturns => {
  const [isAvailable, setIsAvailable] = useState(false)
  const { subscribe } = useContext(InjectedNFCContext)

  const read = useCallback(async (): Promise<string> => {
    if (!isAvailable) {
      throw new Error('No hay NFC inyectado')
    }
    alert('Falta implementar')
    return ''
  }, [isAvailable])

  const abortReadCtrl = useCallback(() => {}, [])

  useEffect(() => {
    setIsAvailable(!!window.Android?.read)
  }, [])

  return {
    isAvailable,
    read,
    abortReadCtrl
  }
}
