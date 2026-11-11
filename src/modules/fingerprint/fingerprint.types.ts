export type FingerprintExposureLevel = 'low' | 'medium' | 'high' | 'unknown'

export interface FingerprintFeature {
  available: boolean
  readable: boolean
}

export interface FingerprintResult {
  scannedAt: number
  exposureLevel: FingerprintExposureLevel
  features: {
    canvas: FingerprintFeature
    webgl: FingerprintFeature
    audioContext: FingerprintFeature
  }
  browserAttributes: {
    userAgent: boolean
    language: boolean
    screenResolution: boolean
    hardwareConcurrency: boolean
    deviceMemory: boolean
  }
  availableSignals: number
  totalSignals: number
}
