export type WebRTCProtectionLevel =
  | 'default'
  | 'public-only'
  | 'disable-non-proxied-udp'

export interface ProtectionControls {
  webRTCProtection: WebRTCProtectionLevel
  blockThirdPartyCookies: boolean
}

export interface ProtectionControlStatus {
  webRTCProtection: WebRTCProtectionLevel
  blockThirdPartyCookies: boolean
}
