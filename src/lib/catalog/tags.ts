import { KINDS } from './kinds'
import type { CatalogEvent } from './types'

type HasTags = { tags: string[][] }

export function tagValue(e: HasTags, name: string): string | undefined {
  return e.tags.find(t => t[0] === name)?.[1]
}

export function coordinate(kind: number, pubkey: string, d: string): string {
  return `${kind}:${pubkey}:${d}`
}

export function coordinateOf(e: CatalogEvent): string | null {
  if (e.kind < 30000 || e.kind >= 40000) return null
  return coordinate(e.kind, e.pubkey, tagValue(e, 'd') ?? '')
}

export function toInt(v: string | undefined): number | undefined {
  if (v === undefined) return undefined
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : undefined
}

/** Newest-wins de-duplication for addressable events (NIP-01 tie-break: lowest id). */
export function latestByAddress(events: CatalogEvent[]): CatalogEvent[] {
  const best = new Map<string, CatalogEvent>()

  for (const e of events) {
    const d = e.tags.find(t => t[0] === 'd')?.[1] ?? ''
    const key = `${e.kind}:${e.pubkey}:${d}`
    const cur = best.get(key)
    if (
      !cur ||
      e.created_at > cur.created_at ||
      (e.created_at === cur.created_at && e.id < cur.id)
    ) {
      best.set(key, e)
    }
  }

  return Array.from(best.values())
}

/**
 * NIP-09 `a`-tag deletions. An `a` tag covers every version up to and
 * including the kind-5's created_at. Author must match the coordinate author.
 */
export function buildDeletionIndex(events: CatalogEvent[]): Map<string, number> {
  const deletions = new Map<string, number>()
  for (const e of events) {
    if (e.kind !== KINDS.DELETION) continue
    for (const t of e.tags) {
      if (t[0] !== 'a' || !t[1]) continue
      const author = t[1].split(':')[1]
      if (author !== e.pubkey) continue
      deletions.set(t[1], Math.max(deletions.get(t[1]) ?? 0, e.created_at))
    }
  }
  return deletions
}

export function isDeleted(
  e: CatalogEvent,
  deletions: Map<string, number>
): boolean {
  const coord = coordinateOf(e)
  if (!coord) return false
  return (deletions.get(coord) ?? -1) >= e.created_at
}
