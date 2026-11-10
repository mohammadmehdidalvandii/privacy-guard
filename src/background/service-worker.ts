import { checkVPNStatus } from '@/modules/vpn/vpn.service'

const VPN_MONITOR_ALARM = 'privacy-guard-vpn-monitor'
const CHECK_VPN_STATUS = 'CHECK_VPN_STATUS'

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
  if (message?.type !== CHECK_VPN_STATUS) {
    return
  }

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
})
