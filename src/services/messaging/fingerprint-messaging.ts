import type { FingerprintResult } from '@/modules/fingerprint/fingerprint.types'

interface FingerprintResponse {
  success: boolean
  data?: FingerprintResult
  error?: string
}

export async function requestFingerprintScan(): Promise<FingerprintResult> {
  const response = (await chrome.runtime.sendMessage({
    type: 'RUN_FINGERPRINT_SCAN',
  })) as FingerprintResponse

  if (!response?.success || !response.data) {
    throw new Error(response?.error || 'Fingerprint scan failed.')
  }

  return response.data
}
