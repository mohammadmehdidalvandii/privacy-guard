export interface NetworkInfo {
  ip: string
  ipType: string
  country: string
  city: string
  timezone: string
  isp: string
  organization: string
  domain: string
  asn: number | null
}

export interface NetworkApiResponse {
  success: boolean
  ip?: string
  type?: string
  country?: string
  city?: string
  timezone?: {
    id?: string
  }
  connection?: {
    asn?: number
    org?: string
    isp?: string
    domain?: string
  }
  message?: string
}
