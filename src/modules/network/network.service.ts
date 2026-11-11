import { fetchNetworkData } from '@/services/api/network-api'
import type { NetworkInfo } from './network.types'

export async function getNetworkInfo(): Promise<NetworkInfo> {
  const data = await fetchNetworkData()

  const asn = data.asn?.match(/\d+/)?.[0]

  return {
    ip: data.ip || 'Unknown',
    ipType: data.version || 'Unknown',
    country: data.country_name || data.country || 'Unknown',
    city: data.city || 'Unknown',
    timezone: data.timezone || 'Unknown',
    isp: data.org || 'Unknown',
    organization: data.org || 'Unknown',
    domain: 'Unknown',
    asn: asn ? Number(asn) : null,
  }
}
