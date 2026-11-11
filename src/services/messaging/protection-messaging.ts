import type {
  ProtectionControls,
  ProtectionControlStatus,
} from '@/modules/protection/protection.types'

import type { ProtectionProfile } from '@/modules/profiles/profile.types'

interface ProtectionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function requestProtectionStatus(): Promise<ProtectionControlStatus> {
  const response = (await chrome.runtime.sendMessage({
    type: 'GET_PROTECTION_STATUS',
  })) as ProtectionResponse<ProtectionControlStatus>

  if (!response?.success || !response.data) {
    throw new Error(
      response?.error || 'Failed to get protection status.',
    )
  }

  return response.data
}

export async function updateProtectionControls(
  controls: ProtectionControls,
): Promise<ProtectionControlStatus> {
  const response = (await chrome.runtime.sendMessage({
    type: 'UPDATE_PROTECTION_CONTROLS',
    controls,
  })) as ProtectionResponse<ProtectionControlStatus>

  if (!response?.success || !response.data) {
    throw new Error(
      response?.error || 'Failed to update protection controls.',
    )
  }

  return response.data
}

export async function applyProtectionProfile(
  profile: ProtectionProfile,
): Promise<ProtectionControlStatus> {
  const response = (await chrome.runtime.sendMessage({
    type: 'APPLY_PROTECTION_PROFILE',
    profile,
  })) as ProtectionResponse<ProtectionControlStatus>

  if (!response?.success || !response.data) {
    throw new Error(
      response?.error || 'Failed to apply protection profile.',
    )
  }

  return response.data
}
