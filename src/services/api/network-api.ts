import { networkApiResponseSchema } from '@/modules/network/network.schema'
import type { NetworkApiResponse } from '@/modules/network/network.types'

const NETWORK_API_URL = 'https://ipwho.is/'
const REQUEST_TIMEOUT = 20_000

export async function fetchNetworkData(): Promise<NetworkApiResponse> {
  const response = await fetch(NETWORK_API_URL, {
    method: 'GET',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  })

  if (!response.ok) {
    throw new Error(`Network API request failed: ${response.status}`)
  }

  const data: unknown = await response.json()

  const result = networkApiResponseSchema.safeParse(data)

  if (!result.success) {
    throw new Error('Invalid network API response')
  }

  if (!result.data.success) {
    throw new Error(result.data.message || 'Network lookup failed')
  }

  return result.data
}
