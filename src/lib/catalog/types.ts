export interface CatalogEvent {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string }
