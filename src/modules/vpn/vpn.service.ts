import { getNetworkInfo } from '@/modules/network/network.service'
import {
  getVPNState,
  saveVPNState,
} from '@/services/storage/vpn-storage'

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

    const now = Date.now()

    const nextState: VPNMonitorState = {
      status:
        previousIp === null
          ? 'unknown'
          : hasIpChanged
            ? 'possible'
            : 'unchanged',
      currentIp,
      previousIp,
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
      lastCheckedAt: Date.now(),
    }

    await saveVPNState(nextState)

    throw error
  }
}
