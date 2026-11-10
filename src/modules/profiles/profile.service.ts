import {
  DEFAULT_PROFILE,
  PROFILE_CONFIGS,
  type ProtectionProfile,
  type ProtectionProfileConfig,
} from './profile.types'

export function getProfileConfig(
  profile: ProtectionProfile = DEFAULT_PROFILE,
): ProtectionProfileConfig {
  return PROFILE_CONFIGS[profile]
}

