import { z } from 'zod';
import { isValidCountryCode } from '@/modules/profiles/country-options';

export const appSettingsSchema = z.object({
  enabled: z.boolean(),
  notifications: z.boolean(),
  locationProtection: z.boolean(),
  privacyProtection: z.boolean(),
  expectedCountryCode: z.string().nullable().refine((code) => code === null || isValidCountryCode(code)),
});
