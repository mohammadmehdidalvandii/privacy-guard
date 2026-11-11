import type {
  GeolocationSetting,
  ProtectionControls,
  WebRTCProtectionLevel,
} from './protection.types'

export const DEFAULT_PROTECTION_CONTROLS: ProtectionControls = {
  webRTCProtection: 'default',
  blockThirdPartyCookies: false,
  geolocation: 'ask',
}

export const WEBRTC_POLICY_MAP: Record<
  WebRTCProtectionLevel,
  chrome.privacy.IPHandlingPolicy
> = {
  default: chrome.privacy.IPHandlingPolicy.DEFAULT,
  'public-only':
    chrome.privacy.IPHandlingPolicy.DEFAULT_PUBLIC_INTERFACE_ONLY,
  'disable-non-proxied-udp':
    chrome.privacy.IPHandlingPolicy.DISABLE_NON_PROXIED_UDP,
}

export const GEOLOCATION_SETTING_MAP: Record<
  GeolocationSetting,
  chrome.contentSettings.LocationContentSetting
> = {
  allow: chrome.contentSettings.LocationContentSetting.ALLOW,
  ask: chrome.contentSettings.LocationContentSetting.ASK,
  block: chrome.contentSettings.LocationContentSetting.BLOCK,
}