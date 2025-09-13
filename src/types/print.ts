import { OrderItem } from './order'

export interface PrintOrder {
  items: OrderItem[]
  total: number
  totalSats: number
  currency: string

  blockNumber?: string
  imageUrl?: string
  qrcode?: string
  currencyB?: string
  totalB?: string
}
