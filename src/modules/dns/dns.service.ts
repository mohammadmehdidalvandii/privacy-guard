import {
  createDNSLeakTest,
  fetchDNSLeakResult,
} from './dns-api'

import type { DNSLeakResult } from './dns.types'

const DNS_REQUEST_TIMEOUT = 8_000
const RESULT_POLL_INTERVAL = 1_000
const MAX_RESULT_ATTEMPTS = 10

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function resolveHostname(hostname: string): Promise<void> {
  await fetch(`https://${hostname}/`, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-store',
    credentials: 'omit',
    redirect: 'manual',
    signal: AbortSignal.timeout(DNS_REQUEST_TIMEOUT),
  })
}

async function triggerDNSLookups(hostnames: string[]): Promise<void> {
  await Promise.allSettled(hostnames.map(resolveHostname))
}

async function waitForDNSResult(
  testId: string,
  expectedLookups: number,
): Promise<DNSLeakResult> {
  let lastResult: DNSLeakResult | null = null

  for (let attempt = 0; attempt < MAX_RESULT_ATTEMPTS; attempt++) {
    try {
      const result = await fetchDNSLeakResult(testId)

      lastResult = result

      if (result.lookups >= expectedLookups) {
        return result
      }
    } catch {
      // The result may not be available yet.
    }

    if (attempt < MAX_RESULT_ATTEMPTS - 1) {
      await wait(RESULT_POLL_INTERVAL)
    }
  }

  if (lastResult) {
    return lastResult
  }

  throw new Error('DNS leak test result is not available.')
}

export async function runDNSLeakTest(): Promise<DNSLeakResult> {
  const test = await createDNSLeakTest()

  await triggerDNSLookups(test.hostnames)

  return waitForDNSResult(test.testId, test.hostnames.length)
}
