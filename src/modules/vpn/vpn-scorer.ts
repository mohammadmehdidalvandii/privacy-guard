import type {
  VPNConfidence,
  VPNStatus,
  VPNEvidenceType,
} from './vpn.types'

interface VPNScoringInput {
  hasIpChanged: boolean
  isHostingProvider: boolean
}

export interface VPNScoringResult {
  status: VPNStatus
  confidence: VPNConfidence
  score: number
  evidence: VPNEvidenceType[]
}

export function scoreVPNSignals(
  input: VPNScoringInput,
): VPNScoringResult {
  const evidence: VPNEvidenceType[] = []

  if (input.hasIpChanged) {
    evidence.push('ip-changed')
  }

  if (input.isHostingProvider) {
    evidence.push('hosting-provider')
  }

  return {
    status: 'not-detected',
    confidence: 'low',
    score: 0,
    evidence,
  }
}
