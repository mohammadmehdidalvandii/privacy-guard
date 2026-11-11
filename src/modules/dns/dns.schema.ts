import { z } from 'zod'

const dnsLeakClientSchema = z.object({
  ip: z.string(),
  city: z.string(),
  country: z.string(),
  countryCode: z.string(),
  lat: z.number(),
  lon: z.number(),
  asn: z.number(),
  org: z.string(),
  hostname: z.string().nullable().optional(),
})

const dnsResolverSchema = z.object({
  ip: z.string(),
  city: z.string(),
  country: z.string(),
  countryCode: z.string(),
  lat: z.number(),
  lon: z.number(),
  asn: z.number(),
  org: z.string(),
  hostname: z.string().nullable(),
  operator: z.string().nullable(),
  anycast: z.boolean(),
  transport: z.string(),
  sawA: z.boolean(),
  sawQ: z.boolean(),
  ecs: z.string().nullable(),
  ecsIsClient: z.boolean().nullable(),
  dnssecOk: z.boolean(),
  count: z.number(),
  original: z.number(),
  echoed: z.number(),
  echoLagMs: z.number().nullable(),
  role: z.enum(['resolver', 'observer']),
  firstSeen: z.number(),
  status: z.string().optional(),
})

const dnsResolverGroupSchema = z.object({
  key: z.string(),
  label: z.string(),
  members: z.array(dnsResolverSchema),
  status: z.string(),
  queries: z.number(),
  share: z.number(),
  city: z.string(),
  country: z.string(),
  countryCode: z.string(),
  lat: z.number(),
  lon: z.number(),
  anycast: z.boolean(),
  hostname: z.string().nullable(),
})

const dnsLeakVerdictSchema = z.object({
  status: z.string(),
  leaking: z.boolean(),
  headline: z.string(),
  detail: z.string(),
})

export const dnsLeakTestResponseSchema = z.object({
  testId: z.string(),
  zone: z.string(),
  client: dnsLeakClientSchema,
  hostnames: z.array(z.string()),
  resultUrl: z.string().url(),
  instructions: z.string(),
})

export const dnsLeakResultSchema = z.object({
  testId: z.string(),
  client: dnsLeakClientSchema,
  resolvers: z.array(dnsResolverSchema),
  groups: z.array(dnsResolverGroupSchema),
  observerGroups: z.array(dnsResolverGroupSchema),
  truncated: z.boolean(),
  lookups: z.number(),
  verdict: dnsLeakVerdictSchema,
})
