export type WebRTCStatus =
  | 'ip-mismatch'
  | 'no-leak-detected'
  | 'unavailable'
  | 'unknown'

export interface WebRTCAnalysis {
  status: WebRTCStatus
  publicIps: string[]
  privateIps: string[]
  hasPublicIpMismatch: boolean
  checkedAt: number
}
