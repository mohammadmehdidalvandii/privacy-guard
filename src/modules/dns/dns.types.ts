export interface DNSLeakClient {
  ip: string
  city: string
  country: string
  countryCode: string
  lat: number
  lon: number
  asn: number
  org: string
  hostname?: string | null
}

export interface DNSResolver {
  ip: string
  city: string
  country: string
  countryCode: string
  lat: number
  lon: number
  asn: number
  org: string
  hostname: string | null
  operator: string | null
  anycast: boolean
  transport: string
  sawA: boolean
  sawQ: boolean
  ecs: string | null
  ecsIsClient: boolean | null
  dnssecOk: boolean
  count: number
  original: number
  echoed: number
  echoLagMs: number | null
  role: 'resolver' | 'observer'
  firstSeen: number
  status?: string
}

export interface DNSResolverGroup {
  key: string
  label: string
  members: DNSResolver[]
  status: string
  queries: number
  share: number
  city: string
  country: string
  countryCode: string
  lat: number
  lon: number
  anycast: boolean
  hostname: string | null
}

export interface DNSLeakVerdict {
  status: string
  leaking: boolean
  headline: string
  detail: string
}

export interface DNSLeakTestResponse {
  testId: string
  zone: string
  client: DNSLeakClient
  hostnames: string[]
  resultUrl: string
  instructions: string
}

export interface DNSLeakResult {
  testId: string
  client: DNSLeakClient
  resolvers: DNSResolver[]
  groups: DNSResolverGroup[]
  observerGroups: DNSResolverGroup[]
  truncated: boolean
  lookups: number
  verdict: DNSLeakVerdict
}
