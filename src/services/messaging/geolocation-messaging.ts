import type { GeolocationResult } from '@/modules/geolocation/geolocation.types'
import { MessageType, type BaseResponse } from './types'

export async function requestGeolocationScan(): Promise<GeolocationResult> {
  const response = (await chrome.runtime.sendMessage({
    type: MessageType.RUN_GEOLOCATION_SCAN,
  })) as BaseResponse<GeolocationResult>

  if (!response?.success || !response.data) {
    throw new Error(response?.error || 'Geolocation scan failed.')
  }

  return response.data
}
