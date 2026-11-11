import { z } from 'zod'

import { checkVPNStatus } from '@/modules/vpn/vpn.service'
import { runDNSLeakTest } from '@/modules/dns/dns.service'
import { runFingerprintScan } from '@/modules/fingerprint/fingerprint.service'
import { runGeolocationScan } from '@/modules/geolocation/geolocation.service'

import {
  applyProtectionControls,
  getProtectionControls,
  resetProtectionControls,
} from '@/modules/protection/protection.service'

import { protectionControlsSchema } from '@/modules/protection/protection.schema'
import { getProfileProtectionControls } from '@/modules/profiles/profile.service'

import {
  clearProtectionSnapshot,
  getProtectionSnapshot,
  getSettings,
  saveProtectionSnapshot,
  saveSettings,
} from '@/services/storage/settings-storage'

const VPN_MONITOR_ALARM = 'privacy-guard-vpn-monitor'

const CHECK_VPN_STATUS = 'CHECK_VPN_STATUS'
const GET_PROTECTION_STATUS = 'GET_PROTECTION_STATUS'
const UPDATE_PROTECTION_CONTROLS = 'UPDATE_PROTECTION_CONTROLS'
const APPLY_PROTECTION_PROFILE = 'APPLY_PROTECTION_PROFILE'
const RUN_DNS_LEAK_TEST = 'RUN_DNS_LEAK_TEST'
const RUN_FINGERPRINT_SCAN = 'RUN_FINGERPRINT_SCAN'
const RUN_GEOLOCATION_SCAN = 'RUN_GEOLOCATION_SCAN'
const SET_EXTENSION_ENABLED = 'SET_EXTENSION_ENABLED'

const profileSchema = z.enum([
  'basic',
  'advanced',
  'custom-location',
  'strict',
])

async function isExtensionEnabled(): Promise<boolean> {
  const settings = await getSettings()
  return settings.enabled
}

async function runVPNMonitor() {
  try {
    if (!(await isExtensionEnabled())) return

    const state = await checkVPNStatus()
    console.log('VPN monitoring updated:', state)
  } catch (error) {
    console.error('VPN monitoring failed:', error)
  }
}

function startVPNMonitoring() {
  chrome.alarms.create(VPN_MONITOR_ALARM, {
    periodInMinutes: 5,
  })

  void runVPNMonitor()
}

async function syncExtensionState() {
  if (await isExtensionEnabled()) {
    startVPNMonitoring()
  } else {
    await chrome.alarms.clear(VPN_MONITOR_ALARM)
  }
}

async function setExtensionEnabled(enabled: boolean): Promise<boolean> {
  const settings = await getSettings()

  if (settings.enabled === enabled) {
    return enabled
  }

  if (!enabled) {
    const currentControls = await getProtectionControls()

    await saveProtectionSnapshot(currentControls)
    await resetProtectionControls()

    await saveSettings({
      ...settings,
      enabled: false,
    })

    await chrome.alarms.clear(VPN_MONITOR_ALARM)

    return false
  }

  const snapshot = await getProtectionSnapshot()

  if (snapshot) {
    await applyProtectionControls(snapshot)
  }

  await saveSettings({
    ...settings,
    enabled: true,
  })

  await clearProtectionSnapshot()
  startVPNMonitoring()

  return true
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Privacy Guard installed successfully.')
  void syncExtensionState()
})

chrome.runtime.onStartup.addListener(() => {
  void syncExtensionState()
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === VPN_MONITOR_ALARM) {
    void runVPNMonitor()
  }
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === SET_EXTENSION_ENABLED) {
    const enabled = message.enabled

    if (typeof enabled !== 'boolean') {
      sendResponse({
        success: false,
        error: 'Invalid extension status.',
      })

      return
    }

    setExtensionEnabled(enabled)
      .then((state) => {
        sendResponse({
          success: true,
          data: state,
        })
      })
      .catch((error: unknown) => {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to update extension status.',
        })
      })

    return true
  }

  if (message?.type === CHECK_VPN_STATUS) {
    isExtensionEnabled()
      .then((enabled) => {
        if (!enabled) {
          throw new Error('Privacy Guard is disabled.')
        }

        return checkVPNStatus()
      })
      .then((state) => {
        sendResponse({ success: true, data: state })
      })
      .catch((error: unknown) => {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'VPN status check failed.',
        })
      })

    return true
  }

  if (message?.type === RUN_DNS_LEAK_TEST) {
    isExtensionEnabled()
      .then((enabled) => {
        if (!enabled) {
          throw new Error('Privacy Guard is disabled.')
        }

        return runDNSLeakTest()
      })
      .then((result) => {
        sendResponse({ success: true, data: result })
      })
      .catch((error: unknown) => {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'DNS leak test failed.',
        })
      })

    return true
  }

  if (message?.type === RUN_FINGERPRINT_SCAN) {
    isExtensionEnabled()
      .then((enabled) => {
        if (!enabled) {
          throw new Error('Privacy Guard is disabled.')
        }

        return runFingerprintScan()
      })
      .then((result) => {
        sendResponse({ success: true, data: result })
      })
      .catch((error: unknown) => {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Fingerprint scan failed.',
        })
      })

    return true
  }

  if (message?.type === RUN_GEOLOCATION_SCAN) {
    isExtensionEnabled()
      .then((enabled) => {
        if (!enabled) {
          throw new Error('Privacy Guard is disabled.')
        }

        return runGeolocationScan()
      })
      .then((result) => {
        sendResponse({ success: true, data: result })
      })
      .catch((error: unknown) => {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Geolocation scan failed.',
        })
      })

    return true
  }

  if (
    message?.type === GET_PROTECTION_STATUS ||
    message?.type === UPDATE_PROTECTION_CONTROLS ||
    message?.type === APPLY_PROTECTION_PROFILE
  ) {
    const handleProtectionMessage = async () => {
      try {
        const enabled = await isExtensionEnabled()

        if (
          !enabled &&
          message.type !== GET_PROTECTION_STATUS
        ) {
          throw new Error('Privacy Guard is disabled.')
        }

        if (message.type === UPDATE_PROTECTION_CONTROLS) {
          const result = protectionControlsSchema.safeParse(
            message.controls,
          )

          if (!result.success) {
            throw new Error('Invalid protection controls.')
          }

          await applyProtectionControls(result.data)
        }

        if (message.type === APPLY_PROTECTION_PROFILE) {
          const result = profileSchema.safeParse(message.profile)

          if (!result.success) {
            throw new Error('Invalid protection profile.')
          }

          const controls = getProfileProtectionControls(result.data)
          await applyProtectionControls(controls)
        }

        const state = await getProtectionControls()

        sendResponse({
          success: true,
          data: state,
        })
      } catch (error) {
        sendResponse({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Protection controls operation failed.',
        })
      }
    }

    void handleProtectionMessage()
    return true
  }
})
