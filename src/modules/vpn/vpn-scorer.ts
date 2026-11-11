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
    score += 20
    evidence.push('ip-changed')
  }

  if (input.isHostingProvider) {
    score += 25
    evidence.push('hosting-provider')
  }

  let status: VPNStatus = 'not-detected'
  let confidence: VPNConfidence = 'low'

  if (score >= 45) {
    status = 'possible'
    confidence = 'medium'
  } else if (score > 0) {
    status = 'possible'
    confidence = 'low'
  }

  return {
    status,
    confidence,
    score,
    evidence,
  }
}
