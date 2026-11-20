import { checkVPNStatus } from '@/modules/vpn/vpn.service';
import { getSettings } from '@/services/storage/settings-storage';

const VPN_MONITOR_ALARM = 'privacy-guard-vpn-monitor';

async function isExtensionEnabled(): Promise<boolean> {
  const settings = await getSettings();
  return settings.enabled;
}

export async function runVPNMonitor(): Promise<void> {
  try {
    if (!(await isExtensionEnabled())) return;

    const state = await checkVPNStatus();
    console.log('VPN monitoring updated:', state);
  } catch (error) {
    console.error('VPN monitoring failed:', error);
  }
}

export function startVPNMonitoring(): void {
  chrome.alarms.create(VPN_MONITOR_ALARM, {
    periodInMinutes: 5,
  });

  void runVPNMonitor();
}

export async function stopVPNMonitoring(): Promise<void> {
  await chrome.alarms.clear(VPN_MONITOR_ALARM);
}

export function setupAlarmListeners(): void {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === VPN_MONITOR_ALARM) {
      void runVPNMonitor();
    }
  });
}
