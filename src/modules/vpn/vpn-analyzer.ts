import type { NetworkInfo } from '@/modules/network/network.types'
import type { VPNEvidenceType } from './vpn.types'

interface ProviderAnalysis {
  isHostingProvider: boolean
  evidence: VPNEvidenceType[]
}

const HOSTING_PROVIDER_PATTERNS = [
  /\bovh\b/i,
  /\bhetzner\b/i,
  /\bdigitalocean\b/i,
  /\bvultr\b/i,
  /\blinode\b/i,
  /\bakamai\b/i,
  /\bamazon\b/i,
  /\baws\b/i,
  /\bgoogle cloud\b/i,
  /\bmicrosoft azure\b/i,
  /\bcloudflare\b/i,
  /\boracle cloud\b/i,
  /\bcontabo\b/i,
  /\bleaseweb\b/i,
]

export function analyzeProvider(
  networkInfo: NetworkInfo,
): ProviderAnalysis {
  const providerDetails = [
    networkInfo.isp,
    networkInfo.organization,
    networkInfo.domain,
  ].join(' ')

  const isHostingProvider = HOSTING_PROVIDER_PATTERNS.some(
    (pattern) => pattern.test(providerDetails),
  )

  return {
    isHostingProvider,
    evidence: isHostingProvider ? ['hosting-provider'] : [],
  }
}
