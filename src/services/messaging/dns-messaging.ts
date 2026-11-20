import type { DNSLeakResult } from '@/modules/dns/dns.types'
import { MessageType, type BaseResponse } from './types'

export async function requestDNSLeakTest(): Promise<DNSLeakResult> {
  const response = (await chrome.runtime.sendMessage({
    type: MessageType.RUN_DNS_LEAK_TEST,
  })) as BaseResponse<DNSLeakResult>

  if (!response?.success || !response.data) {
    throw new Error(response?.error || 'DNS leak test failed.')
  }

  return response.data
}
