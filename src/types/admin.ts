export interface InfoResponse {
  tag: 'laWallet:info'
  status: {
    initialized: boolean
    associated: boolean
    activated: boolean
    hasDelegation: boolean
  }
  ntag424:
    | {
        ok: {
          cid: string
          ctr: number
          ctrNew: number
          otc: string | null
          design: {
            uuid: string
            name: string
          }
        }
      }
    | { error: string }
    | null
  card:
    | {
        ok: {
          uuid: string
          name: string
          description: string
          enabled: boolean
        }
      }
    | { error: string }
    | null
  holder:
    | {
        ok: {
          pubKey: string
          delegations: {
            kind: number | null
            since: string
            until: string
            isCurrent: boolean
            delegationConditions: string
            delegationToken: string
          }[]
        }
      }
    | { error: string }
    | null
}

export interface ResetResponse {
  nonce: string
  name: string
}
