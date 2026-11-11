export type GeolocationPermission =
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unknown'

export type GeolocationExposureLevel =
  | 'high'
  | 'medium'
  | 'low'
  | 'unknown'

export interface GeolocationResult {
  scannedAt: number
  available: boolean
  permission: GeolocationPermission
  exposureLevel: GeolocationExposureLevel
}

export type TimezoneConsistencyStatus =
  | 'match'
  | 'mismatch'
  | 'unknown'

export interface TimezoneConsistencyResult {
  browserTimezone: string
  networkTimezone: string
  status: TimezoneConsistencyStatus
}