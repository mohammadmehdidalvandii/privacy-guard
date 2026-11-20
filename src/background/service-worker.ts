import { MessageType } from '@/services/messaging/types'
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
import { createGlobalSwitchManager } from '@/modules/protection/global-switch.service'
import { ProtectionControlWriteError } from '@/modules/protection/protection.service'
import {
  getExtensionTransition,
  saveExtensionTransition,
} from '@/services/storage/settings-storage'

import {
  clearProtectionSnapshot,
  getProtectionSnapshot,
  getSettings,
  saveProtectionSnapshot,
  saveSettings,
} from '@/services/storage/settings-storage'
import {
  setupAlarmListeners,
  startVPNMonitoring,
  stopVPNMonitoring,
} from './alarm-manager'

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

const globalSwitch = createGlobalSwitchManager({
  getSettings,
  saveSettings,
  getSnapshot: getProtectionSnapshot,
  saveSnapshot: saveProtectionSnapshot,
  clearSnapshot: clearProtectionSnapshot,
  getTransition: getExtensionTransition,
  saveTransition: saveExtensionTransition,
  getControls: getProtectionControls,
  applyControls: applyProtectionControls,
  resetControls: resetProtectionControls,
  startMonitoring: startVPNMonitoring,
  stopMonitoring: stopVPNMonitoring,
})

async function syncExtensionState(): Promise<void> {
  await globalSwitch.recover()
}

async function setExtensionEnabled(enabled: boolean): Promise<boolean> {
  return globalSwitch.setEnabled(enabled)
}
chrome.runtime.onInstalled.addListener(() => {
  console.log('Privacy Guard installed successfully.')
  void syncExtensionState()
})

chrome.runtime.onStartup.addListener(() => {
  void syncExtensionState()
})

setupAlarmListeners()

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MessageType.SET_EXTENSION_ENABLED) {
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

  if (message?.type === MessageType.CHECK_VPN_STATUS) {
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

  if (message?.type === MessageType.RUN_DNS_LEAK_TEST) {
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

  if (message?.type === MessageType.RUN_FINGERPRINT_SCAN) {
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

  if (message?.type === MessageType.RUN_GEOLOCATION_SCAN) {
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
    message?.type === MessageType.GET_PROTECTION_STATUS ||
    message?.type === MessageType.UPDATE_PROTECTION_CONTROLS ||
    message?.type === MessageType.APPLY_PROTECTION_PROFILE
  ) {
    const handleProtectionMessage = async () => {
      try {
        const enabled = await isExtensionEnabled()

        if (
          !enabled &&
          message.type !== MessageType.GET_PROTECTION_STATUS
        ) {
          throw new Error('Privacy Guard is disabled.')
        }

        if (message.type === MessageType.UPDATE_PROTECTION_CONTROLS) {
          const result = protectionControlsSchema.safeParse(
            message.controls,
          )

          if (!result.success) {
            throw new Error('Invalid protection controls.')
          }

          await applyProtectionControls(result.data)
        }

        if (message.type === MessageType.APPLY_PROTECTION_PROFILE) {
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
          data:
            error instanceof ProtectionControlWriteError
              ? error.result
              : undefined,
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
