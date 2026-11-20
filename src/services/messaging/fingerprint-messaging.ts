import type { FingerprintResult } from '@/modules/fingerprint/fingerprint.types'
import { MessageType, type BaseResponse } from './types'

export async function requestFingerprintScan(): Promise<FingerprintResult> {
  const response = (await chrome.runtime.sendMessage({
    type: MessageType.RUN_FINGERPRINT_SCAN,
  })) as BaseResponse<FingerprintResult>

  if (!response?.success || !response.data) {
    throw new Error(response?.error || 'Fingerprint scan failed.')
  }

  return response.data
}
