import { checkVPNStatus } from '@/modules/vpn/vpn.service'
import { runDNSLeakTest } from '@/modules/dns/dns.service'

import {
  applyProtectionControls,
  getProtectionControls,
} from '@/modules/protection/protection.service'

import { protectionControlsSchema } from '@/modules/protection/protection.schema'

const VPN_MONITOR_ALARM = 'privacy-guard-vpn-monitor'

const CHECK_VPN_STATUS = 'CHECK_VPN_STATUS'
const GET_PROTECTION_STATUS = 'GET_PROTECTION_STATUS'
const UPDATE_PROTECTION_CONTROLS = 'UPDATE_PROTECTION_CONTROLS'
const RUN_DNS_LEAK_TEST = 'RUN_DNS_LEAK_TEST'

async function runVPNMonitor() {
  try {
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

chrome.runtime.onInstalled.addListener(() => {
  console.log('Privacy Guard installed successfully.')
  startVPNMonitoring()
})

chrome.runtime.onStartup.addListener(() => {
  startVPNMonitoring()
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === VPN_MONITOR_ALARM) {
    void runVPNMonitor()
  }
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === CHECK_VPN_STATUS) {
    checkVPNStatus()
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
              : 'VPN status check failed.',
        })
      })

    return true
  }

  if (message?.type === RUN_DNS_LEAK_TEST) {
    runDNSLeakTest()
      .then((result) => {
        sendResponse({
          success: true,
          data: result,
        })
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

  if (
    message?.type === GET_PROTECTION_STATUS ||
    message?.type === UPDATE_PROTECTION_CONTROLS
  ) {
    const handleProtectionMessage = async () => {
      try {
        if (message.type === UPDATE_PROTECTION_CONTROLS) {
          const result = protectionControlsSchema.safeParse(
            message.controls,
          )

          if (!result.success) {
            throw new Error('Invalid protection controls.')
          }

          await applyProtectionControls(result.data)
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
