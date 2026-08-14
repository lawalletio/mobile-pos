import type { Category } from './category'
import type { Product } from './product'

export interface CategoryGroup {
  category: Category | null
  products: Product[]
}

/**
 * Arrange a catalog into storefront sections.
 * `t` (slug) is membership; a category's `a` list only orders within the group.
 */
export function groupCatalog(
  products: readonly Product[],
  categories: readonly Category[]
): CategoryGroup[] {
  const sorted = [...categories].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es-AR')
  )

  const bySlug = new Map<string, Category>()
  for (const c of sorted) {
    const existing = bySlug.get(c.slug)
    if (!existing || c.updatedAt > existing.updatedAt) bySlug.set(c.slug, c)
  }

  const grouped = new Map<string, Product[]>()
  const uncategorised: Product[] = []

  for (const p of products) {
    const primary = p.categories.find(s => bySlug.has(s))
    if (primary) {
      const list = grouped.get(primary) ?? []
      list.push(p)
      grouped.set(primary, list)
    } else {
      uncategorised.push(p)
    }
  }

  const groups: CategoryGroup[] = []
  for (const c of sorted) {
    if (bySlug.get(c.slug) !== c) continue
    const list = grouped.get(c.slug)
    if (!list?.length) continue

    const order = new Map(c.productDs.map((d, i) => [d, i]))
    list.sort(
      (a, b) =>
        (order.get(a.d) ?? Number.MAX_SAFE_INTEGER) -
          (order.get(b.d) ?? Number.MAX_SAFE_INTEGER) ||
        a.title.localeCompare(b.title, 'es-AR')
    )
    groups.push({ category: c, products: list })
  }

  if (uncategorised.length) {
    uncategorised.sort((a, b) => a.title.localeCompare(b.title, 'es-AR'))
    groups.push({ category: null, products: uncategorised })
  }

  return groups
}
