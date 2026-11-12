import type { ProtectionControls } from '@/modules/protection/protection.types'

export type ProtectionProfile =
  | 'basic'
  | 'advanced'
  | 'custom-location'
  | 'strict'

export interface ProtectionProfileConfig {
  label: string
  description: string
  controls: ProtectionControls
}

export const DEFAULT_PROFILE: ProtectionProfile = 'basic'

export const PROFILE_CONFIGS: Record<
  ProtectionProfile,
  ProtectionProfileConfig
> = {
  basic: {
    label: 'Basic',
    description: 'Default browser privacy controls',
    controls: {
      webRTCProtection: 'default',
      blockThirdPartyCookies: false,
      geolocation: 'ask',
    },
  },

  advanced: {
    label: 'Advanced',
    description: 'Blocks third-party cookies and limits WebRTC',
    controls: {
      webRTCProtection: 'public-only',
      blockThirdPartyCookies: true,
      geolocation: 'ask',
    },
  },

  'custom-location': {
    label: 'Custom Location',
    description: 'Preferred country with cookie and WebRTC controls',
    controls: {
      webRTCProtection: 'public-only',
      blockThirdPartyCookies: true,
      geolocation: 'ask',
    },
  },

  strict: {
    label: 'Strict Privacy',
    description: 'Blocks location requests, cookies, and non-proxied UDP',
    controls: {
      webRTCProtection: 'disable-non-proxied-udp',
      blockThirdPartyCookies: true,
      geolocation: 'block',
    },
  },
}
