export interface NetworkInfo {
  ip: string
  country: string
  city: string
  timezone: string
  isp: string
}

export interface NetworkApiResponse {
  success: boolean
  ip?: string
  country?: string
  city?: string
  timezone?: {
    id?: string
  }
  connection?: {
    isp?: string
  }
  message?: string
}
