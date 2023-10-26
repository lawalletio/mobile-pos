export interface LNURLResponse {
  tag: string
  callback: string
  k1: string
  minWithdrawable: number
  maxWithdrawable: number
  defaultDescription: string
}

export enum LNURLWStatus {
  IDLE = 'IDLE',
  REQUESTING = 'REQUESTING',
  CALLBACK = 'CALLBACK',
  DONE = 'DONE',
  ERROR = 'ERROR'
}
