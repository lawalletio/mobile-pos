import { AvailableCurrencies } from './config'

export interface ProductData {
  id: number
  category_id: number
  name: string
  description: string
  price: {
    value: number
    currency: AvailableCurrencies
  }
}

export interface ProductQtyData extends ProductData {
  qty: number
}
