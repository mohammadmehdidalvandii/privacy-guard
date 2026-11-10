import { fetchNetworkData } from '@/services/api/network-api'
import type { NetworkInfo } from './network.types'

export async function getNetworkInfo(): Promise<NetworkInfo> {
  const data = await fetchNetworkData()

  return {
    ip: data.ip || 'Unknown',
    country: data.country || 'Unknown',
    city: data.city || 'Unknown',
    timezone: data.timezone?.id || 'Unknown',
    isp: data.connection?.isp || 'Unknown',
  }
}
