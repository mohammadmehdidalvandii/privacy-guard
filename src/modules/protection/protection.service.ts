import {
  DEFAULT_PROTECTION_CONTROLS,
  GEOLOCATION_SETTING_MAP,
  WEBRTC_POLICY_MAP,
} from './protection.constants'

import type {
  ProtectionControls,
  ProtectionControlStatus,
} from './protection.types'

type ProtectionControlName =
  | 'webRTCProtection'
  | 'blockThirdPartyCookies'
  | 'geolocation'

export interface ProtectionControlWriteResult {
  success: boolean
  controls: Record<ProtectionControlName, boolean>
  priorStateRestored: boolean | null
}

export class ProtectionControlWriteError extends Error {
  readonly result: ProtectionControlWriteResult

  constructor(result: ProtectionControlWriteResult) {
    super(
      result.priorStateRestored
        ? 'Some browser protection controls could not be updated, but the prior settings were restored.'
        : 'Some browser protection controls could not be updated and the prior settings may be partially changed. Please check your protection settings.',
    )
    this.name = 'ProtectionControlWriteError'
    this.result = result
  }
}

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

function writeControl(
  name: ProtectionControlName,
  controls: ProtectionControls,
): Promise<void> {
  switch (name) {
    case 'webRTCProtection':
      return chrome.privacy.network.webRTCIPHandlingPolicy.set({
        value: WEBRTC_POLICY_MAP[controls.webRTCProtection],
      })
    case 'blockThirdPartyCookies':
      return chrome.privacy.websites.thirdPartyCookiesAllowed.set({
        value: !controls.blockThirdPartyCookies,
      })
    case 'geolocation':
      return chrome.contentSettings.location.set({
        primaryPattern: '<all_urls>',
        setting: GEOLOCATION_SETTING_MAP[controls.geolocation],
      })
  }
}

export async function applyProtectionControls(
  controls: ProtectionControls,
): Promise<ProtectionControlWriteResult> {
  const priorControls = await getProtectionControls()
  const names: ProtectionControlName[] = [
    'webRTCProtection',
    'blockThirdPartyCookies',
    'geolocation',
  ]
  const writes = await Promise.allSettled(
    names.map((name) => writeControl(name, controls)),
  )
  const controlResults = Object.fromEntries(
    names.map((name, index) => [name, writes[index]?.status === 'fulfilled']),
  ) as Record<ProtectionControlName, boolean>

  if (writes.every((result) => result.status === 'fulfilled')) {
    return {
      success: true,
      controls: controlResults,
      priorStateRestored: null,
    }
  }

  const successfulNames = names.filter((name) => controlResults[name])
  const rollbacks = await Promise.allSettled(
    successfulNames.map((name) => writeControl(name, priorControls)),
  )
  const priorStateRestored = rollbacks.every(
    (result) => result.status === 'fulfilled',
  )

  throw new ProtectionControlWriteError({
    success: false,
    controls: controlResults,
    priorStateRestored,
  })
}

export async function resetProtectionControls(): Promise<void> {
  await Promise.all([
    chrome.privacy.network.webRTCIPHandlingPolicy.clear({}),
    chrome.privacy.websites.thirdPartyCookiesAllowed.clear({}),
    chrome.contentSettings.location.clear({}),
  ])
}
