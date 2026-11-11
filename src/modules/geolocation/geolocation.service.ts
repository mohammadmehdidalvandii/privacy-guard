import type { GeolocationResult } from './geolocation.types'

export async function runGeolocationScan(): Promise<GeolocationResult> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })

  if (!tab?.id) {
    throw new Error('No active browser tab found.')
  }

  if (!tab.url || !/^https?:\/\//i.test(tab.url)) {
    throw new Error(
      'Geolocation scanning is not available on this page.',
    )
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      const available = 'geolocation' in navigator

      if (!available) {
        return {
          scannedAt: Date.now(),
          available: false,
          permission: 'unknown' as const,
          exposureLevel: 'unknown' as const,
        }
      }

      try {
        const permission = await navigator.permissions.query({
          name: 'geolocation',
        })

        const permissionState = permission.state

        return {
          scannedAt: Date.now(),
          available: true,
          permission: permissionState,
          exposureLevel:
            permissionState === 'granted'
              ? 'high'
              : permissionState === 'prompt'
                ? 'medium'
                : permissionState === 'denied'
                  ? 'low'
                  : 'unknown',
        }
      } catch {
        return {
          scannedAt: Date.now(),
          available: true,
          permission: 'unknown' as const,
          exposureLevel: 'unknown' as const,
        }
      }
    },
  })

  const result = results[0]?.result as GeolocationResult | undefined

  if (!result) {
    throw new Error('Geolocation scan returned no result.')
  }

  return result
}