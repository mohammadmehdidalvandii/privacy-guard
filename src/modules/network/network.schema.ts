import { z } from 'zod'

export const networkApiResponseSchema = z.object({
  success: z.boolean(),
  ip: z.string().optional(),
  type: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  timezone: z
    .object({
      id: z.string().optional(),
    })
    .optional(),
  connection: z
    .object({
      asn: z.number().optional(),
      org: z.string().optional(),
      isp: z.string().optional(),
      domain: z.string().optional(),
    })
    .optional(),
  message: z.string().optional(),
})
