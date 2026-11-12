export interface NetworkInfo {
  ip: string
  ipType: string
  country: string
  countryCode: string | null
  city: string
  timezone: string
  isp: string
  organization: string
  domain: string
  asn: number | null
}

export interface IpifyResponse {
  ip: string
}

export interface NetworkApiResponse {
  ip?: string
  version?: string
  country?: string
  country_name?: string
  city?: string
  timezone?: string
  asn?: string
  org?: string
}
