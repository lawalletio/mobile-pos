export enum ScanCardStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  REQUESTING = 'REQUESTING',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

export enum ScanAction {
  IDENTITY_QUERY = 'identityQuery',
  EXTENDED_SCAN = 'extendedScan',
  WRONG = 'wrong',
  DEFAULT = 'default'
}
