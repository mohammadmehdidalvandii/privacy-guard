import { z } from 'zod'

export const ipifyResponseSchema = z.object({
  ip: z.string().min(1),
})

export const networkApiResponseSchema = z.object({
  ip: z.string().optional(),
  version: z.string().optional(),
  country: z.string().optional(),
  country_name: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  asn: z.string().optional(),
  org: z.string().optional(),
})
