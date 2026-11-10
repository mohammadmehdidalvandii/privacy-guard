
import type {
  ProtectionControls,
  WebRTCProtectionLevel,
} from './protection.types'

export const DEFAULT_PROTECTION_CONTROLS: ProtectionControls = {
  webRTCProtection: 'default',
  blockThirdPartyCookies: false,
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
