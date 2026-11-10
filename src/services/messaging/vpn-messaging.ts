import type { VPNMonitorState } from '@/modules/vpn/vpn.types'

interface VPNStatusResponse {
  success: boolean
  data?: VPNMonitorState
  error?: string
}

export async function requestVPNStatus(): Promise<VPNMonitorState> {
  const response = (await chrome.runtime.sendMessage({
    type: 'CHECK_VPN_STATUS',
  })) as VPNStatusResponse

  if (!response?.success || !response.data) {
    throw new Error(response?.error || 'VPN status check failed.')
  }

  return response.data
}
