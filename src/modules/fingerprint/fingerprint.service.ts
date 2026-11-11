import type { FingerprintResult } from './fingerprint.types'

export async function runFingerprintScan(): Promise<FingerprintResult> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })

  if (!tab?.id) {
    throw new Error('No active browser tab found.')
  }

  if (!tab.url || !/^https?:\/\//i.test(tab.url)) {
    throw new Error(
      'Fingerprint scanning is not available on this page.',
    )
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      let canvasAvailable = false
      let canvasReadable = false

      try {
        if (context) {
          canvasAvailable = true
          context.fillRect(0, 0, 10, 10)
          canvasReadable = canvas.toDataURL().length > 0
        }
      } catch {
        canvasAvailable = Boolean(context)
      }

let webglAvailable = false
let webglReadable: boolean

      try {
        const webglCanvas = document.createElement('canvas')
        const gl =
          webglCanvas.getContext('webgl2') ??
          webglCanvas.getContext('webgl')

        webglAvailable = Boolean(gl)
        webglReadable = Boolean(
          gl?.getExtension('WEBGL_debug_renderer_info'),
        )
      } catch {
        webglReadable = false
      }

      const audioAvailable =
        typeof window.AudioContext === 'function'

      const attributes = {
        userAgent: Boolean(navigator.userAgent),
        language: Boolean(navigator.language),
        screenResolution: screen.width > 0 && screen.height > 0,
        hardwareConcurrency: navigator.hardwareConcurrency > 0,
        deviceMemory:
          'deviceMemory' in navigator &&
          Boolean(
            (navigator as Navigator & { deviceMemory?: number })
              .deviceMemory,
          ),
      }

      const signals = [
        canvasReadable,
        webglReadable,
        audioAvailable,
        ...Object.values(attributes),
      ]

      const availableSignals = signals.filter(Boolean).length
      const totalSignals = signals.length
      const ratio = availableSignals / totalSignals

      return {
        scannedAt: Date.now(),
        exposureLevel:
          ratio >= 0.8 ? 'high' : ratio >= 0.4 ? 'medium' : 'low',
        features: {
          canvas: {
            available: canvasAvailable,
            readable: canvasReadable,
          },
          webgl: {
            available: webglAvailable,
            readable: webglReadable,
          },
          audioContext: {
            available: audioAvailable,
            readable: audioAvailable,
          },
        },
        browserAttributes: attributes,
        availableSignals,
        totalSignals,
      }
    },
  })

  const result = results[0]?.result as FingerprintResult | undefined

  if (!result) {
    throw new Error('Fingerprint scan returned no result.')
  }

  return result
}
