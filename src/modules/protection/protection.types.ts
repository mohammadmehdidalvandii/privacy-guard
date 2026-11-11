export type WebRTCProtectionLevel =
  | 'default'
  | 'public-only'
  | 'disable-non-proxied-udp'

export type GeolocationSetting = 'allow' | 'ask' | 'block'

export interface ProtectionControls {
  webRTCProtection: WebRTCProtectionLevel
  blockThirdPartyCookies: boolean
  geolocation: GeolocationSetting
}

export interface ProtectionControlStatus {
  webRTCProtection: WebRTCProtectionLevel
  blockThirdPartyCookies: boolean
  geolocation: GeolocationSetting
}