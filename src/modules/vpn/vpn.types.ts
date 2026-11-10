export type VPNStatus =
  | 'possible'
  | 'unchanged'
  | 'unknown'

export interface VPNMonitorState {
  status: VPNStatus
  currentIp: string | null
  previousIp: string | null
  lastCheckedAt: number | null
  lastChangedAt: number | null
}
