import type { GeolocationResult } from '@/modules/geolocation/geolocation.types'

interface GeolocationResponse {
  success: boolean
  data?: GeolocationResult
  error?: string
}

export async function requestGeolocationScan(): Promise<GeolocationResult> {
  const response = (await chrome.runtime.sendMessage({
    type: 'RUN_GEOLOCATION_SCAN',
  })) as GeolocationResponse

  if (!response?.success || !response.data) {
    throw new Error(response?.error || 'Geolocation scan failed.')
  }

  return response.data
}