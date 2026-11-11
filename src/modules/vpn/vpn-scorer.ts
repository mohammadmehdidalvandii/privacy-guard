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
  let score = 0

  if (input.hasIpChanged) {
    evidence.push('ip-changed')
    score += 10
  }

  if (input.isHostingProvider) {
    evidence.push('hosting-provider')
    score += 20
  }

  const status: VPNStatus =
    score >= 30
      ? 'possible'
      : 'not-detected'

  const confidence: VPNConfidence =
    score >= 30
      ? 'medium'
      : 'low'

  return {
    status,
    confidence,
    score,
    evidence,
  }
}
