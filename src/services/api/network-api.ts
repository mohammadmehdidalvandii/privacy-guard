import {
  ipifyResponseSchema,
  networkApiResponseSchema,
} from '@/modules/network/network.schema'

import type {
  IpifyResponse,
  NetworkApiResponse,
} from '@/modules/network/network.types'

const IPIFY_API_URL = 'https://api.ipify.org?format=json'
const GEOIP_API_URL = 'https://ipapi.co'
const REQUEST_TIMEOUT = 20_000

export async function fetchNetworkData(): Promise<NetworkApiResponse> {
  const ipResponse = await fetch(IPIFY_API_URL, {
    method: 'GET',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  })

  if (!ipResponse.ok) {
    throw new Error(`IP lookup failed: ${ipResponse.status}`)
  }

  const ipData: unknown = await ipResponse.json()
  const ipResult = ipifyResponseSchema.safeParse(ipData)

  if (!ipResult.success) {
    throw new Error('Invalid IPify response')
  }

  const { ip } = ipResult.data satisfies IpifyResponse

  const geoResponse = await fetch(
    `${GEOIP_API_URL}/${encodeURIComponent(ip)}/json/`,
    {
      method: 'GET',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    },
  )

  if (!geoResponse.ok) {
    throw new Error(`GeoIP lookup failed: ${geoResponse.status}`)
  }

  const geoData: unknown = await geoResponse.json()
  const geoResult = networkApiResponseSchema.safeParse(geoData)

  if (!geoResult.success) {
    throw new Error('Invalid GeoIP response')
  }

  return {
    ...geoResult.data,
    ip,
  }
}
