import { z } from 'zod'

export const networkApiResponseSchema = z.object({
  success: z.boolean(),
  ip: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  timezone: z
    .object({
      id: z.string().optional(),
    })
    .optional(),
  connection: z
    .object({
      isp: z.string().optional(),
    })
    .optional(),
  message: z.string().optional(),
})
