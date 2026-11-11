
import { isValidCountryCode } from '@/modules/profiles/country-options'

import type { ProtectionControls } from '@/modules/protection/protection.types'

export interface AppSettings {
  enabled: boolean
  notifications: boolean
  locationProtection: boolean
  privacyProtection: boolean
  expectedCountryCode: string | null
}

export const DEFAULT_SETTINGS: AppSettings = {
  enabled: true,
  notifications: true,
  locationProtection: true,
  privacyProtection: true,
  expectedCountryCode: null,
}

const STORAGE_KEY = 'privacy-guard-settings'
const PROTECTION_SNAPSHOT_KEY = 'privacy-guard-protection-snapshot'

export async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  const stored: unknown = result[STORAGE_KEY]

  if (!stored || typeof stored !== 'object') {
    return DEFAULT_SETTINGS
  }

  const data = stored as Record<string, unknown>

  return {
    enabled:
      typeof data['enabled'] === 'boolean'
        ? data['enabled']
        : DEFAULT_SETTINGS.enabled,

    notifications:
      typeof data['notifications'] === 'boolean'
        ? data['notifications']
        : DEFAULT_SETTINGS.notifications,

    locationProtection:
      typeof data['locationProtection'] === 'boolean'
        ? data['locationProtection']
        : DEFAULT_SETTINGS.locationProtection,

    privacyProtection:
      typeof data['privacyProtection'] === 'boolean'
        ? data['privacyProtection']
        : DEFAULT_SETTINGS.privacyProtection,

    expectedCountryCode: isValidCountryCode(data['expectedCountryCode'])
      ? data['expectedCountryCode']
      : null,
  }
}

export async function saveSettings(
  settings: AppSettings,
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: settings,
  })
}

export async function saveProtectionSnapshot(
  controls: ProtectionControls,
): Promise<void> {
  await chrome.storage.local.set({
    [PROTECTION_SNAPSHOT_KEY]: controls,
  })
}

export async function getProtectionSnapshot(): Promise<ProtectionControls | null> {
  const result = await chrome.storage.local.get(PROTECTION_SNAPSHOT_KEY)
  const snapshot: unknown = result[PROTECTION_SNAPSHOT_KEY]

  if (!snapshot || typeof snapshot !== 'object') {
    return null
  }

  return snapshot as ProtectionControls
}

export async function clearProtectionSnapshot(): Promise<void> {
  await chrome.storage.local.remove(PROTECTION_SNAPSHOT_KEY)
}

export async function resetSettings(): Promise<AppSettings> {
  await saveSettings(DEFAULT_SETTINGS)
  await clearProtectionSnapshot()

  return DEFAULT_SETTINGS
}
