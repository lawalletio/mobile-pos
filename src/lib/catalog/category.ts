import { KINDS } from './kinds'
import { derivePosId } from './pos-id'
import { slugify } from './slug'
import { tagValue, toInt } from './tags'
import type { ProductImage } from './product'
import type { CatalogEvent, ParseResult } from './types'

export interface Category {
  d: string
  posId: number
  name: string
  slug: string
  emoji?: string
  summary?: string
  image?: ProductImage
  order: number
  productDs: string[]
  eventId: string
  updatedAt: number
}

const NIP44_B64 = /^A[A-Za-z0-9+/]{40,}={0,2}$/

/**
 * Guard against kind:30405 collision with Shopstr encrypted carts.
 * Requires: same merchant pubkey, d+title, no p tag, empty/non-NIP44 content,
 * and `a` tags that look like 30402|30403 coordinates.
 */
export function isOurCollection(
  e: CatalogEvent,
  merchantPubkey: string
): boolean {
  if (e.kind !== KINDS.CATEGORY) return false
  if (e.pubkey !== merchantPubkey) return false
  if (!tagValue(e, 'd') || !tagValue(e, 'title')) return false
  if (e.tags.some(t => t[0] === 'p')) return false

  if (e.content.length > 0) {
    if (NIP44_B64.test(e.content.trim()) || e.content.length > 512) return false
  }

  return e.tags
    .filter(t => t[0] === 'a')
    .every(t => /^3040[23]:[0-9a-f]{64}:/.test(t[1] ?? ''))
}

export function parseCategoryEvent(
  e: CatalogEvent,
  merchantPubkey: string
): ParseResult<Category> {
  if (!isOurCollection(e, merchantPubkey)) {
    return { ok: false, reason: 'not our collection' }
  }

  const d = tagValue(e, 'd')!
  const name = tagValue(e, 'title')!
  const imageTag = e.tags.find(t => t[0] === 'image' && t[1])

  let image: ProductImage | undefined
  if (imageTag) {
    const [w, h] = (imageTag[2] ?? '').split('x').map(n => Number.parseInt(n, 10))
    image = {
      url: imageTag[1]!,
      width: Number.isFinite(w) ? w! : 0,
      height: Number.isFinite(h) ? h! : 0,
      order: 0
    }
  }

  return {
    ok: true,
    value: {
      d,
      posId: derivePosId(d),
      name,
      slug: tagValue(e, 't') ?? slugify(name),
      emoji: tagValue(e, 'icon'),
      summary: tagValue(e, 'summary'),
      image,
      order: toInt(tagValue(e, 'order')) ?? 0,
      productDs: e.tags
        .filter(t => t[0] === 'a' && t[1]?.startsWith(`${KINDS.PRODUCT}:`))
        .map(t => t[1]!.split(':')[2] ?? '')
        .filter(Boolean),
      eventId: e.id,
      updatedAt: e.created_at
    }
  }
}
