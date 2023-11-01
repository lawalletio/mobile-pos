// React/Next
import { useCallback, useState } from 'react'

// Thirdparty
import axios from 'axios'

// Types
import { ScanCardStatus } from '@/types/card'
import { LNURLResponse } from '@/types/lnurl'

// Hooks
import { useNfc } from 'use-nfc-hook'
import { useInjectedNFC } from './useInjectedNFC'

export type CardReturns = {
  isAvailable: boolean
  permission: string
  status: ScanCardStatus
  scan: () => Promise<LNURLResponse>
  stop: () => void
}

const requestLNURL = async (url: string) => {
  const response = await axios.get(url)
  if (response.status !== 200) {
    alert(JSON.stringify(response.data))
    throw new Error('Hubo un error: ' + JSON.stringify(response.data))
  }

  return response.data
}

export const useCard = (): CardReturns => {
  const {
    isNDEFAvailable,
    permission,
    read,
    abortReadCtrl: abortReadNativeCtrl
  } = useNfc()
  const {
    isAvailable: isInjectedAvailable,
    read: readInjected,
    abortReadCtrl: abortReadInjectedCtrl
  } = useInjectedNFC()
  const [status, setStatus] = useState<ScanCardStatus>(ScanCardStatus.IDLE)

  const readNative = useCallback(async (): Promise<string> => {
    const response = await read()
    const record = response.message.records[0]
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(record.data)
  }, [read])

  const scan = async (): Promise<LNURLResponse> => {
    setStatus(ScanCardStatus.SCANNING)
    let url = ''
    try {
      console.info('USING Injected')
      const response = await (isInjectedAvailable
        ? readInjected()
        : readNative())
      url = response.replace('lnurlw://', 'https://')
    } catch (error) {
      alert('ALERT on reading: ' + JSON.stringify(error))
      console.log('ERROR ', error)
    }

    setStatus(ScanCardStatus.REQUESTING)
    const response = requestLNURL(url)
    setStatus(ScanCardStatus.DONE)
    return response
  }

  return {
    isAvailable: isInjectedAvailable || !!isNDEFAvailable,
    permission,
    status,
    scan,
    stop: isInjectedAvailable ? abortReadInjectedCtrl : abortReadNativeCtrl
  }
}
