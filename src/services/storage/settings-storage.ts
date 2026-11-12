
import { isValidCountryCode } from '@/modules/profiles/country-options'
import { protectionControlsSchema } from '@/modules/protection/protection.schema'

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
const EXTENSION_TRANSITION_KEY = 'privacy-guard-extension-transition'

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

  const parsedSnapshot = protectionControlsSchema.safeParse(snapshot)

  if (!parsedSnapshot.success) {
    throw new Error('Stored protection snapshot is invalid.')
  }

  return parsedSnapshot.data
}

export async function clearProtectionSnapshot(): Promise<void> {
  await chrome.storage.local.remove(PROTECTION_SNAPSHOT_KEY)
}

export type ExtensionTransition =
  | 'idle'
  | 'pausing'
  | 'paused'
  | 'resuming'

export async function getExtensionTransition(): Promise<ExtensionTransition | null> {
  const result = await chrome.storage.local.get(EXTENSION_TRANSITION_KEY)
  const transition: unknown = result[EXTENSION_TRANSITION_KEY]

  return transition === 'idle' ||
    transition === 'pausing' ||
    transition === 'paused' ||
    transition === 'resuming'
    ? transition
    : null
}

export async function saveExtensionTransition(
  transition: ExtensionTransition,
): Promise<void> {
  await chrome.storage.local.set({
    [EXTENSION_TRANSITION_KEY]: transition,
  })
}

export async function resetSettings(): Promise<AppSettings> {
  await saveSettings(DEFAULT_SETTINGS)
  await clearProtectionSnapshot()

  return DEFAULT_SETTINGS
}
