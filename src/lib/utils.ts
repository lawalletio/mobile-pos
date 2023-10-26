// Libs
import bolt11 from 'bolt11'

// Types
import type { IOrderEventContent } from '@/types/order'
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
