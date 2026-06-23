import { useLocalStorage } from 'react-use-storage'

import { ITab, ITabsCache } from '@/types/tab'
import { ProductQtyData } from '@/types/product'
import { mergeProducts } from '@/lib/utils'

interface TabsReturns {
  tabs: ITabsCache
  addToTab: (
    name: string,
    items: ProductQtyData[],
    amountSat: number,
    existingId?: string
  ) => ITab
  removeTab: (id: string) => void
  clearTabs: () => void
}

const generateTabId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useTabs = (): TabsReturns => {
  const [tabs, setTabs] = useLocalStorage<ITabsCache>('tabs', {})

  const addToTab = (
    name: string,
    items: ProductQtyData[],
    amountSat: number,
    existingId?: string
  ): ITab => {
    const now = Date.now()
    const existing = existingId ? tabs[existingId] : undefined

    if (existing) {
      const updated: ITab = {
        ...existing,
        items: mergeProducts(existing.items, items),
        amount: existing.amount + amountSat,
        updatedAt: now
      }
      setTabs({ ...tabs, [existing.id]: updated })
      return updated
    }

    const id = generateTabId()
    const tab: ITab = {
      id,
      name,
      items,
      amount: amountSat,
      createdAt: now,
      updatedAt: now
    }
    setTabs({ ...tabs, [id]: tab })
    return tab
  }

  const removeTab = (id: string) => {
    const rest = { ...tabs }
    delete rest[id]
    setTabs(rest)
  }

  const clearTabs = () => setTabs({})

  return { tabs, addToTab, removeTab, clearTabs }
}
