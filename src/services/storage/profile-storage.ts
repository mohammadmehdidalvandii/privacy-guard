
import {
  DEFAULT_PROFILE,
  type ProtectionProfile,
} from '@/modules/profiles/profile.types'

const STORAGE_KEY = 'privacy-guard-profile'

const validProfiles: ProtectionProfile[] = [
  'basic',
  'advanced',
  'custom-location',
  'strict',
]

function isProtectionProfile(value: unknown): value is ProtectionProfile {
  return (
    typeof value === 'string' &&
    validProfiles.includes(value as ProtectionProfile)
  )
}

export async function getProfile(): Promise<ProtectionProfile> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  const profile: unknown = result[STORAGE_KEY]

  return isProtectionProfile(profile) ? profile : DEFAULT_PROFILE
}

export async function saveProfile(
  profile: ProtectionProfile,
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: profile,
  })
}

export async function resetProfile(): Promise<ProtectionProfile> {
  await saveProfile(DEFAULT_PROFILE)

  return DEFAULT_PROFILE
}
