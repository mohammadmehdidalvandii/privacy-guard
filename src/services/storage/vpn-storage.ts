import type { VPNMonitorState } from '@/modules/vpn/vpn.types'

const STORAGE_KEY = 'privacy-guard-vpn-state'

export const DEFAULT_VPN_STATE: VPNMonitorState = {
  status: 'unknown',
  currentIp: null,
  previousIp: null,
  lastCheckedAt: null,
  lastChangedAt: null,
}

export async function getVPNState(): Promise<VPNMonitorState> {
  const result = await chrome.storage.local.get(STORAGE_KEY)

  return {
    ...DEFAULT_VPN_STATE,
    ...(result[STORAGE_KEY] ?? {}),
  }
}

export async function saveVPNState(
  state: VPNMonitorState,
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: state,
  })
}

export async function resetVPNState(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY)
}
