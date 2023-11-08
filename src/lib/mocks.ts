import { InfoResponse, ResetResponse } from '@/types/admin'

export const getMockInfo = async (): Promise<InfoResponse> => {
  return {
    tag: 'laWallet:info',
    status: {
      initialized: false,
      associated: false,
      activated: false,
      hasDelegation: false
    },
    ntag424:
      // | {
      //     ok: {
      //       cid: string
      //       ctr: number
      //       ctrNew: number
      //       otc: string | null
      //       design: {
      //         uuid: string
      //         name: string
      //       }
      //     }
      //   }
      { error: 'string' },
    // | null

    card:
      // | {
      //     ok: {
      //       uuid: string
      //       name: string
      //       description: string
      //       enabled: boolean
      //     }
      //   }
      { error: 'string' },
    // | null
    holder:
      // | {
      //     ok: {
      //       pubKey: string
      //       delegations: {
      //         kind: number | null
      //         since: string
      //         until: string
      //         isCurrent: boolean
      //         delegationConditions: string
      //         delegationToken: string
      //       }[]
      //     }
      //   }
      { error: 'string' }
    // | null
  }
}

export const getMockReset = async (): Promise<ResetResponse> => {
  return {
    name: 'pipo',
    nonce: 'PUOSANDJKANSDJK'
  }
}