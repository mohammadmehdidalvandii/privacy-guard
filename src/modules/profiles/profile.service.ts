import {
  DEFAULT_PROFILE,
  PROFILE_CONFIGS,
  type ProtectionProfile,
  type ProtectionProfileConfig,
} from './profile.types'

import type { ProtectionControls } from '@/modules/protection/protection.types'

export function getProfileConfig(
  profile: ProtectionProfile = DEFAULT_PROFILE,
): ProtectionProfileConfig {
  return PROFILE_CONFIGS[profile]
}

export function getProfileProtectionControls(
  profile: ProtectionProfile,
): ProtectionControls {
  switch (profile) {
    case 'basic':
      return {
        webRTCProtection: 'default',
        blockThirdPartyCookies: false,
      }

    case 'advanced':
    case 'custom-location':
      return {
        webRTCProtection: 'public-only',
        blockThirdPartyCookies: true,
      }

    case 'strict':
      return {
        webRTCProtection: 'disable-non-proxied-udp',
        blockThirdPartyCookies: true,
      }
  }
}
