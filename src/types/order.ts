import { Event } from 'nostr-tools'
import { ProductQtyData } from './product'
import { LNURLResponse } from './lnurl'

export interface IOrderEventContent {
  amount: number
  vote: number
}

export interface OrderItem {
  qty: number
  name: string
  price: number
}

export interface IPayment {
  id: string
  items: ProductQtyData[]
  amount: number
  event: Event
  lud06: LNURLResponse
  currentInvoice?: string
  lud21VerifyUrl?: string
  isPaid: boolean
  isPrinted: boolean
  createdAt?: number
  nostrPublishStatus?: 'pending' | 'published' | 'failed'
  nostrRelayUrls?: string[]
  zapReceiptStatus?: 'pending' | 'confirmed'
  zapReceiptRelayUrls?: string[]
}

export interface IPaymentCache {
  [orderId: string]: IPayment
}
