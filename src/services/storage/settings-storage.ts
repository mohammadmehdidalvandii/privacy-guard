
import { isValidCountryCode } from '@/modules/profiles/country-options'

export interface AppSettings {
  notifications: boolean
  locationProtection: boolean
  privacyProtection: boolean
  expectedCountryCode: string | null
}

export const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  locationProtection: true,
  privacyProtection: true,
  expectedCountryCode: null,
}

const STORAGE_KEY = 'privacy-guard-settings'

export async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  const stored: unknown = result[STORAGE_KEY]

  if (!stored || typeof stored !== 'object') {
    return DEFAULT_SETTINGS
  }

  const data = stored as Record<string, unknown>

  return {
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

export async function resetSettings(): Promise<AppSettings> {
  await saveSettings(DEFAULT_SETTINGS)

  return DEFAULT_SETTINGS
}
