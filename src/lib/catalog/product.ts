import { KINDS } from './kinds'
import { derivePosId } from './pos-id'
import { parsePriceTag, type Price } from './price'
import { slugify } from './slug'
import { tagValue, toInt } from './tags'
import type { CatalogEvent, ParseResult } from './types'

export type NipStatus = 'active' | 'sold'
export type Visibility = 'hidden' | 'on-sale' | 'pre-order'
export type ProductKind = 'simple' | 'variable' | 'variation'
export type ProductFormat = 'digital' | 'physical'

export interface ProductImage {
  url: string
  width: number
  height: number
  order: number
}

export interface Product {
  d: string
  posId: number
  status: NipStatus
  title: string
  summary?: string
  sku?: string
  description: string
  price: Price | null
  stock: number | null
  visibility: Visibility
  type: { kind: ProductKind; format: ProductFormat }
  /** Ordered slugs. categories[0] is primary and the only one the POS sees. */
  categories: string[]
  images: ProductImage[]
  publishedAt: number
  updatedAt: number
  eventId: string
  pubkey: string
}

function asVisibility(v: string | undefined): Visibility | undefined {
  return v === 'hidden' || v === 'on-sale' || v === 'pre-order' ? v : undefined
}

function parseTypeTag(e: Pick<CatalogEvent, 'tags'>) {
  const t = e.tags.find(x => x[0] === 'type')
  if (!t) return undefined
  const kind = t[1]
  const format = t[2]
  const validKind: ProductKind =
    kind === 'variable' || kind === 'variation' || kind === 'simple'
      ? kind
      : 'simple'
  const validFormat: ProductFormat = format === 'physical' ? 'physical' : 'digital'
  return { kind: validKind, format: validFormat }
}

export function parseProductEvent(e: CatalogEvent): ParseResult<Product> {
  if (e.kind !== KINDS.PRODUCT) {
    return { ok: false, reason: 'wrong kind' }
  }

  const d = tagValue(e, 'd')
  if (!d) return { ok: false, reason: 'missing d tag' }

  if (e.tags.some(t => t[0] === 'deleted')) {
    return { ok: false, reason: 'tombstone' }
  }

  const price = parsePriceTag(e.tags.find(t => t[0] === 'price'))
  const stockRaw = tagValue(e, 'stock') ?? tagValue(e, 'quantity')

  const images = e.tags
    .filter(t => t[0] === 'image' && t[1])
    .map((t, i) => {
      const [w, h] = (t[2] ?? '').split('x').map(n => Number.parseInt(n, 10))
      return {
        url: t[1]!,
        width: Number.isFinite(w) ? w! : 0,
        height: Number.isFinite(h) ? h! : 0,
        order: toInt(t[3]) ?? i
      }
    })
    .sort((a, b) => a.order - b.order)

  return {
    ok: true,
    value: {
      d,
      posId: derivePosId(d),
      status: tagValue(e, 'status') === 'sold' ? 'sold' : 'active',
      title: tagValue(e, 'title') ?? '(sin título)',
      summary: tagValue(e, 'summary'),
      sku: tagValue(e, 'sku')?.trim() || undefined,
      description: e.content,
      price,
      stock: stockRaw !== undefined ? (toInt(stockRaw) ?? 0) : null,
      visibility: asVisibility(tagValue(e, 'visibility')) ?? 'on-sale',
      type: parseTypeTag(e) ?? { kind: 'simple', format: 'digital' },
      categories: e.tags
        .filter(t => t[0] === 't' && t[1])
        .map(t => slugify(t[1]!))
        .filter(Boolean),
      images,
      publishedAt: toInt(tagValue(e, 'published_at')) ?? e.created_at,
      updatedAt: e.created_at,
      eventId: e.id,
      pubkey: e.pubkey
    }
  }
}

export function isPubliclyVisible(p: Product): boolean {
  return p.status === 'active' && p.visibility !== 'hidden'
}
