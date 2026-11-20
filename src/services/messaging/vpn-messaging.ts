import type { VPNMonitorState } from '@/modules/vpn/vpn.types'
import { MessageType, type BaseResponse } from './types'

export async function requestVPNStatus(): Promise<VPNMonitorState> {
  const response = (await chrome.runtime.sendMessage({
    type: MessageType.CHECK_VPN_STATUS,
  })) as BaseResponse<VPNMonitorState>

  if (!response?.success || !response.data) {
    throw new Error(response?.error || 'VPN status check failed.')
  }

  return response.data
}
