
export interface AppSettings {
  notifications: boolean
  locationProtection: boolean
  privacyProtection: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  locationProtection: true,
  privacyProtection: true,
}

const STORAGE_KEY = 'privacy-guard-settings'

export async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY)

  return {
    ...DEFAULT_SETTINGS,
    ...(result[STORAGE_KEY] ?? {}),
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
