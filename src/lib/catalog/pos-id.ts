import { sha256 } from '@noble/hashes/sha2'
import { utf8ToBytes } from '@noble/hashes/utils'

/** int32-safe, and never 0 — 0 is reserved for the "Sin categoría" bucket. */
const MAX = 2_147_483_646

function int31(s: string): number {
  const h = sha256(utf8ToBytes(s))
  const n = ((h[0]! << 24) | (h[1]! << 16) | (h[2]! << 8) | h[3]!) >>> 0
  return (n % MAX) + 1
}

/** Candidate sequence depends ONLY on this item's own `d`. */
export function derivePosId(d: string, probe = 0): number {
  return int31(probe === 0 ? d : `${d}:${probe}`)
}

export interface PosIdAssignment {
  ids: Map<string, number>
  conflicts: string[]
}

/**
 * Assign collision-free ids across a set.
 * Iterates in sorted-`d` order so the result is independent of relay order.
 */
export function assignPosIds(
  items: readonly { d: string }[]
): PosIdAssignment {
  const ids = new Map<string, number>()
  const taken = new Set<number>()
  const conflicts: string[] = []

  for (const item of [...items].sort((a, b) =>
    a.d < b.d ? -1 : a.d > b.d ? 1 : 0
  )) {
    let probe = 0
    let id = derivePosId(item.d)
    while (taken.has(id)) {
      conflicts.push(item.d)
      id = derivePosId(item.d, ++probe)
    }
    taken.add(id)
    ids.set(item.d, id)
  }

  return { ids, conflicts }
}
