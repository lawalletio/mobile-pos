import type { AvailableCurrencies } from '@/types/config'
import type { ProductData } from '@/types/product'
import type { Category } from './category'
import type { CategoryGroup } from './group'
import { assignPosIds } from './pos-id'
import { isSupportedCurrency } from './price'

export interface PosCategory {
  id: number
  name: string
}

export interface PosMenu {
  products: ProductData[]
  categories: PosCategory[]
}

const UNCATEGORISED_ID = 0
const UNCATEGORISED_NAME = 'Sin categoría'

export function projectPosMenu(groups: CategoryGroup[]): PosMenu {
  const pricedGroups = groups
    .map(g => ({
      category: g.category,
      products: g.products.filter(
        p => p.price && isSupportedCurrency(p.price.currency)
      )
    }))
    .filter(g => g.products.length > 0)

  const allProducts = pricedGroups.flatMap(g => g.products)
  const allCategories = pricedGroups
    .map(g => g.category)
    .filter((c): c is Category => c !== null)

  const productIds = assignPosIds(allProducts)
  const categoryIds = assignPosIds(allCategories)

  const products: ProductData[] = []
  const categories: PosCategory[] = []

  for (const group of pricedGroups) {
    const categoryId = group.category
      ? (categoryIds.ids.get(group.category.d) ?? group.category.posId)
      : UNCATEGORISED_ID

    if (group.category) {
      categories.push({
        id: categoryId,
        name: group.category.name
      })
    } else {
      categories.push({
        id: UNCATEGORISED_ID,
        name: UNCATEGORISED_NAME
      })
    }

    for (const p of group.products) {
      products.push({
        id: productIds.ids.get(p.d) ?? p.posId,
        category_id: categoryId,
        name: p.title,
        description: p.summary || p.description,
        price: {
          value: p.price!.amount,
          currency: p.price!.currency as AvailableCurrencies
        }
      })
    }
  }

  return { products, categories }
}
