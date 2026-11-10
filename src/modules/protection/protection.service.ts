import {
  DEFAULT_PROTECTION_CONTROLS,
  WEBRTC_POLICY_MAP,
} from './protection.constants'

import type {
  ProtectionControls,
  ProtectionControlStatus,
} from './protection.types'

export async function getProtectionControls(): Promise<ProtectionControlStatus> {
  const [webRTC, thirdPartyCookies] = await Promise.all([
    chrome.privacy.network.webRTCIPHandlingPolicy.get({}),
    chrome.privacy.websites.thirdPartyCookiesAllowed.get({}),
  ])

  return {
    webRTCProtection:
      Object.entries(WEBRTC_POLICY_MAP).find(
        ([, policy]) => policy === webRTC.value,
      )?.[0] as ProtectionControlStatus['webRTCProtection'] ??
      DEFAULT_PROTECTION_CONTROLS.webRTCProtection,

    blockThirdPartyCookies: !thirdPartyCookies.value,
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
  ])
}
