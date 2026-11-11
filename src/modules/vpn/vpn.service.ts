import { getNetworkInfo } from '@/modules/network/network.service'
import {
  getVPNState,
  saveVPNState,
} from '@/services/storage/vpn-storage'

import { analyzeProvider } from './vpn-analyzer'
import { scoreVPNSignals } from './vpn-scorer'

import type { VPNMonitorState } from './vpn.types'

export async function checkVPNStatus(): Promise<VPNMonitorState> {
  const previousState = await getVPNState()

  try {
    const networkInfo = await getNetworkInfo()
    const currentIp = networkInfo.ip

    if (!currentIp || currentIp === 'Unknown') {
      throw new Error('Invalid network IP address.')
    }

    const previousIp = previousState.currentIp
    const hasIpChanged =
      previousIp !== null && previousIp !== currentIp

    const providerAnalysis = analyzeProvider(networkInfo)

    const scoring = scoreVPNSignals({
      hasIpChanged,
      isHostingProvider: providerAnalysis.isHostingProvider,
    })

    const now = Date.now()

    const nextState: VPNMonitorState = {
      ...scoring,
      currentIp,
      previousIp,
      currentAsn: networkInfo.asn,
      currentOrganization: networkInfo.organization,
      lastCheckedAt: now,
      lastChangedAt: hasIpChanged
        ? now
        : previousState.lastChangedAt,
    }

    await saveVPNState(nextState)

    return nextState
  } catch (error) {
    const nextState: VPNMonitorState = {
      ...previousState,
      status: 'unknown',
      confidence: 'low',
      lastCheckedAt: Date.now(),
    }

    await saveVPNState(nextState)

    throw error
  }
}
