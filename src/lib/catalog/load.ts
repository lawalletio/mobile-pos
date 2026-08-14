import NDK, {
  NDKEvent,
  NDKKind,
  NDKRelaySet,
  NDKRelayStatus
} from '@nostr-dev-kit/ndk'
import { parseCategoryEvent } from './category'
import { groupCatalog } from './group'
import { KINDS } from './kinds'
import { isPubliclyVisible, parseProductEvent } from './product'
import { projectPosMenu, type PosMenu } from './project'
import {
  buildDeletionIndex,
  isDeleted,
  latestByAddress
} from './tags'
import type { CatalogEvent } from './types'

const FETCH_TIMEOUT_MS = 8000

export class CatalogUnreachableError extends Error {
  constructor() {
    super('No se pudo consultar el catálogo en Nostr')
    this.name = 'CatalogUnreachableError'
  }
}

function toCatalogEvent(e: NDKEvent): CatalogEvent {
  const raw = e.rawEvent()
  return {
    id: raw.id ?? e.id ?? '',
    pubkey: raw.pubkey,
    created_at: raw.created_at ?? 0,
    kind: raw.kind ?? 0,
    tags: raw.tags,
    content: raw.content
  }
}

function fetchCatalogEvents(
  ndk: NDK,
  pubkey: string,
  relaySet: NDKRelaySet
): Promise<Set<NDKEvent>> {
  return new Promise((resolve, reject) => {
    const collected = new Map<string, NDKEvent>()
    const sub = ndk.subscribe(
      [
        {
          kinds: [KINDS.PRODUCT as NDKKind, KINDS.CATEGORY as NDKKind],
          authors: [pubkey]
        },
        { kinds: [KINDS.DELETION as NDKKind], authors: [pubkey] }
      ],
      { closeOnEose: true, groupable: false },
      relaySet
    )

    let settled = false
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      sub.stop()
      const events = new Set(collected.values())
      if (error && events.size === 0) reject(error)
      else resolve(events)
    }

    sub.on('event', (event: NDKEvent) => {
      collected.set(event.id, event)
    })
    sub.on('eose', () => finish())

    const timer = setTimeout(() => {
      finish(new CatalogUnreachableError())
    }, FETCH_TIMEOUT_MS)
  })
}

export async function loadCatalog(
  ndk: NDK,
  pubkey: string,
  relays: string[]
): Promise<PosMenu> {
  const relaySet = NDKRelaySet.fromRelayUrls(relays, ndk)
  const events = await fetchCatalogEvents(ndk, pubkey, relaySet)

  if (events.size === 0) {
    const connected = Array.from(relaySet.relays).some(
      r => r.status >= NDKRelayStatus.CONNECTED
    )
    if (!connected) throw new CatalogUnreachableError()
  }

  const catalogEvents = Array.from(events).map(toCatalogEvent)
  const deletions = buildDeletionIndex(catalogEvents)
  const live = catalogEvents.filter(e => !isDeleted(e, deletions))
  const addressable = latestByAddress(
    live.filter(e => e.kind >= 30000 && e.kind < 40000)
  )

  const products = []
  const categories = []

  for (const e of addressable) {
    if (e.kind === KINDS.PRODUCT) {
      const parsed = parseProductEvent(e)
      if (parsed.ok && isPubliclyVisible(parsed.value)) {
        products.push(parsed.value)
      }
    } else if (e.kind === KINDS.CATEGORY) {
      const parsed = parseCategoryEvent(e, pubkey)
      if (parsed.ok) categories.push(parsed.value)
    }
  }

  return projectPosMenu(groupCatalog(products, categories))
}
