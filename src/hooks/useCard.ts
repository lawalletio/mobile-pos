import { useState } from 'react'
import { ScanCardStatus } from '@/types/card'
import { LNURLResponse } from '@/types/lnurl'
import { useNfc } from 'use-nfc-hook'
import axios from 'axios'

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
  const { isNDEFAvailable, permission, read, abortReadCtrl } = useNfc()
  const [status, setStatus] = useState<ScanCardStatus>(ScanCardStatus.IDLE)
  const scan = async (): Promise<LNURLResponse> => {
    setStatus(ScanCardStatus.SCANNING)
    let url = ''
    try {
      const response = await read()
      const record = response.message.records[0]
      const decoder = new TextDecoder('utf-8')
      const decodedContent = decoder.decode(record.data)
      url = decodedContent.replace('lnurlw://', 'https://')
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
    isAvailable: !!isNDEFAvailable,
    permission,
    status,
    scan,
    stop: abortReadCtrl
  }
}
