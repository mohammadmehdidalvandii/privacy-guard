export type VPNStatus =
  | 'likely'
  | 'possible'
  | 'not-detected'
  | 'unknown'

export type VPNConfidence = 'low' | 'medium' | 'high'

export type VPNEvidenceType =
  | 'ip-changed'
  | 'hosting-provider'
  | 'datacenter-network'
  | 'webrtc-leak'
  | 'webrtc-public-ip-match'

export interface VPNMonitorState {
  status: VPNStatus
  confidence: VPNConfidence
  score: number
  evidence: VPNEvidenceType[]
  currentIp: string | null
  previousIp: string | null
  currentAsn: number | null
  currentOrganization: string | null
  lastCheckedAt: number | null
  lastChangedAt: number | null
}
