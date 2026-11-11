import {
  DEFAULT_PROTECTION_CONTROLS,
  GEOLOCATION_SETTING_MAP,
  WEBRTC_POLICY_MAP,
} from './protection.constants'

import type {
  ProtectionControls,
  ProtectionControlStatus,
} from './protection.types'

export async function getProtectionControls(): Promise<ProtectionControlStatus> {
  const [webRTC, thirdPartyCookies, geolocation] = await Promise.all([
    chrome.privacy.network.webRTCIPHandlingPolicy.get({}),
    chrome.privacy.websites.thirdPartyCookiesAllowed.get({}),
    chrome.contentSettings.location.get({
      primaryUrl: 'https://example.com',
    }),
  ])

  return {
    webRTCProtection:
      Object.entries(WEBRTC_POLICY_MAP).find(
        ([, policy]) => policy === webRTC.value,
      )?.[0] as ProtectionControlStatus['webRTCProtection'] ??
      DEFAULT_PROTECTION_CONTROLS.webRTCProtection,

    blockThirdPartyCookies: !thirdPartyCookies.value,

    geolocation:
      geolocation.setting in GEOLOCATION_SETTING_MAP
        ? geolocation.setting as ProtectionControlStatus['geolocation']
        : DEFAULT_PROTECTION_CONTROLS.geolocation,
  }
}

export async function applyProtectionControls(
  controls: ProtectionControls,
): Promise<void> {
  await Promise.all([
    chrome.privacy.network.webRTCIPHandlingPolicy.set({
      value: WEBRTC_POLICY_MAP[controls.webRTCProtection],
    }),

    chrome.privacy.websites.thirdPartyCookiesAllowed.set({
      value: !controls.blockThirdPartyCookies,
    }),

    chrome.contentSettings.location.set({
      primaryPattern: '<all_urls>',
      setting: GEOLOCATION_SETTING_MAP[controls.geolocation],
    }),
  ])
}