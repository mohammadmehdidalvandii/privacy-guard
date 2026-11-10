import type {
  ProtectionControls,
  ProtectionControlStatus,
} from '@/modules/protection/protection.types'

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