export enum ScanCardStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  REQUESTING = 'REQUESTING',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

export enum ScanAction {
  PAY_REQUEST = 'payRequest',
  IDENTITY_QUERY = 'identityQuery',
  EXTENDED_SCAN = 'extendedScan',
  DEFAULT = 'default'
}
