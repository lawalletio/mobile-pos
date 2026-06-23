import { ProductQtyData } from './product'

export interface ITab {
  id: string // generated (crypto.randomUUID())
  name: string // customer name
  items: ProductQtyData[] // accumulated items across rounds
  amount: number // accumulated total in SAT
  createdAt: number
  updatedAt: number
}

export interface ITabsCache {
  [tabId: string]: ITab
}
