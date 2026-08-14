export const CATALOG_READ_RELAYS = [
  'wss://relay.lacrypta.ar',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.nostr.band'
]

export function catalogRelays(
  posRelays: string[] = [],
  nip05Relays: string[] = []
): string[] {
  return Array.from(
    new Set(
      [...posRelays, ...nip05Relays, ...CATALOG_READ_RELAYS]
        .map(relay => relay.trim())
        .filter(Boolean)
        .map(relay => (relay.startsWith('wss://') ? relay : `wss://${relay}`))
        .map(relay => relay.replace(/\/+$/, ''))
    )
  )
}
