import { z } from 'zod'

export const protectionControlsSchema = z.object({
  webRTCProtection: z.enum([
    'default',
    'public-only',
    'disable-non-proxied-udp',
  ]),
  blockThirdPartyCookies: z.boolean(),
  geolocation: z.enum(['allow', 'ask', 'block']),
})