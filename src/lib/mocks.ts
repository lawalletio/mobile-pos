import { InfoResponse, ResetResponse } from '@/types/admin'

export const getMockInfo = async (): Promise<InfoResponse> => {
  return {
    tag: 'laWallet:info',
    info: {
      status: {
        initialized: true,
        associated: true,
        activated: true,
        hasDelegation: true,
        hasIdentity: true
      },
      ntag424: {
        ok: {
          cid: 'CIDCARD',
          ctr: 1,
          ctrNew: 4,
          otc: '324234234',
          design: {
            uuid: 'asddasdsasda',
            name: 'LABITCONF'
          }
        }
      },

      card: {
        ok: {
          uuid: 'string',
          name: 'string',
          description: 'string',
          enabled: true
        }
      },
      holder: {
        ok: {
          pubKey:
            '8e74cf71a9d756f514e57a0c6392b032e832a936525a6298258187d94c5c90ea',
          delegations: [
            {
              kind: 1112,
              since: 'string',
              until: 'string',
              isCurrent: true,
              delegationConditions: 'string',
              delegationToken: 'string'
            }
          ]
        }
      },
      identity: {
        name: 'CHUCHIOOO'
      }
    }
  }
}

export const getMockReset = async (): Promise<ResetResponse> => {
  return {
    name: 'pipo',
    nonce: 'PUOSANDJKANSDJK'
  }
}
