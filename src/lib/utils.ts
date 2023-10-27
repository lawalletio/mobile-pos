// Libs
import bolt11 from 'bolt11'

// Types
import type { IOrderEventContent } from '@/types/order'
import { TransferTypes } from '@/types/transaction'
import type { Event } from 'nostr-tools'

export const parseOrderDescription = (event: Event): IOrderEventContent => {
  return JSON.parse(
    event.tags.find(tag => tag[0] === 'description')![1]!
  ) as IOrderEventContent
}

export const parseZapInvoice = (event: Event): bolt11.PaymentRequestObject => {
  const paidInvoice = event.tags.find(tag => tag[0] === 'bolt11')?.[1]
  return bolt11.decode(paidInvoice!)
}

export const validateEmail = (email: string): RegExpMatchArray | null => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
}

export const detectTransferType = (data: string): TransferTypes | false => {
  const cleanStr: string = data.includes('lightning://')
    ? data.replace('lightning://', '').toUpperCase()
    : data.toUpperCase()

  const isLUD16 = validateEmail(cleanStr)
  if (isLUD16) return TransferTypes.LUD16

  if (cleanStr.includes('LNURL')) return TransferTypes.LNURL
  if (cleanStr.includes('LNBC')) return TransferTypes.INVOICE

  return false
}

export const isValidLightningURL = (url: string): boolean => {
  const pattern = /^lightning:\/\/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return pattern.test(url)
}

export const extractLNURLFromQR = (url: string): string | null => {
  const pattern =
    /^lightning:\/\/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
  const matches = url.match(pattern)

  return matches ? matches[1] : null
}
