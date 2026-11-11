import type { DNSLeakResult } from '@/modules/dns/dns.types'

interface DNSLeakResponse {
  success: boolean
  data?: DNSLeakResult
  error?: string
}

export async function requestDNSLeakTest(): Promise<DNSLeakResult> {
  const response = (await chrome.runtime.sendMessage({
    type: 'RUN_DNS_LEAK_TEST',
  })) as DNSLeakResponse

  if (!response?.success || !response.data) {
    throw new Error(response?.error || 'DNS leak test failed.')
  }

  return response.data
}
