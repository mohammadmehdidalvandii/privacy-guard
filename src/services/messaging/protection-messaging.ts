import type {
  ProtectionControls,
  ProtectionControlStatus,
} from '@/modules/protection/protection.types'

import type { ProtectionProfile } from '@/modules/profiles/profile.types'
import { MessageType, type BaseResponse } from './types'

export async function requestProtectionStatus(): Promise<ProtectionControlStatus> {
  const response = (await chrome.runtime.sendMessage({
    type: MessageType.GET_PROTECTION_STATUS,
  })) as BaseResponse<ProtectionControlStatus>

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
    type: MessageType.UPDATE_PROTECTION_CONTROLS,
    controls,
  })) as BaseResponse<ProtectionControlStatus>

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
    type: MessageType.APPLY_PROTECTION_PROFILE,
    profile,
  })) as BaseResponse<ProtectionControlStatus>

  if (!response?.success || !response.data) {
    throw new Error(
      response?.error || 'Failed to apply protection profile.',
    )
  }

  return response.data
}

export async function setExtensionEnabled(
  enabled: boolean,
): Promise<boolean> {
  const response = (await chrome.runtime.sendMessage({
    type: MessageType.SET_EXTENSION_ENABLED,
    enabled,
  })) as BaseResponse<boolean>

  if (!response?.success || response.data !== enabled) {
    throw new Error(
      response?.error || 'Failed to update extension status.',
    )
  }

  return response.data
}
