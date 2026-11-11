import {
  dnsLeakResultSchema,
  dnsLeakTestResponseSchema,
} from './dns.schema'

import type {
  DNSLeakResult,
  DNSLeakTestResponse,
} from './dns.types'

const DNS_LEAK_API_URL = 'https://dnsleak.dev/api'
const REQUEST_TIMEOUT = 20_000

export async function createDNSLeakTest(): Promise<DNSLeakTestResponse> {
  const response = await fetch(`${DNS_LEAK_API_URL}/new`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  })

  if (!response.ok) {
    throw new Error(`DNS test creation failed: ${response.status}`)
  }

  const data: unknown = await response.json()
  const result = dnsLeakTestResponseSchema.safeParse(data)

  if (!result.success) {
    throw new Error('Invalid DNS test response.')
  }

  return result.data
}

export async function fetchDNSLeakResult(
  testId: string,
): Promise<DNSLeakResult> {
  const response = await fetch(
    `${DNS_LEAK_API_URL}/result/${encodeURIComponent(testId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    },
  )

  if (!response.ok) {
    throw new Error(`DNS result lookup failed: ${response.status}`)
  }

  const data: unknown = await response.json()
  const result = dnsLeakResultSchema.safeParse(data)

  if (!result.success) {
    throw new Error('Invalid DNS leak result.')
  }

  return result.data
}
