
export type ProtectionProfile =
  | 'basic'
  | 'advanced'
  | 'custom-location'
  | 'strict'

export interface ProtectionProfileConfig {
  locationProtection: boolean
  webrtcProtection: boolean
  fingerprintProtection: boolean
  dnsLeakMonitoring: boolean
  blockThirdPartyCookies: boolean
}

export const DEFAULT_PROFILE: ProtectionProfile = 'basic'

export const PROFILE_CONFIGS: Record<
  ProtectionProfile,
  ProtectionProfileConfig
> = {
  basic: {
    locationProtection: true,
    webrtcProtection: false,
    fingerprintProtection: false,
    dnsLeakMonitoring: false,
    blockThirdPartyCookies: false,
  },

  advanced: {
    locationProtection: true,
    webrtcProtection: true,
    fingerprintProtection: true,
    dnsLeakMonitoring: true,
    blockThirdPartyCookies: false,
  },

  'custom-location': {
    locationProtection: true,
    webrtcProtection: true,
    fingerprintProtection: true,
    dnsLeakMonitoring: true,
    blockThirdPartyCookies: false,
  },

  strict: {
    locationProtection: true,
    webrtcProtection: true,
    fingerprintProtection: true,
    dnsLeakMonitoring: true,
    blockThirdPartyCookies: true,
  },
}
