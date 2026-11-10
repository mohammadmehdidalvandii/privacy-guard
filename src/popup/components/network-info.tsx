
import { Globe, MapPin, Clock, Wifi } from 'lucide-react'

const networkInfo = {
  ip: '185.220.101.45',
  country: 'Germany',
  city: 'Frankfurt',
  timezone: 'Europe/Berlin',
  isp: 'Example Network Provider',
}

function NetworkInfo() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Network Information</h2>
        <span className="text-xs text-muted-foreground">Mock Data</span>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Globe className="size-5 text-primary" />

          <div>
            <p className="text-xs text-muted-foreground">Public IP Address</p>
            <p className="text-sm font-semibold">{networkInfo.ip}</p>
          </div>
        </div>

        <div className="my-3 border-t" />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium">
                {networkInfo.city}, {networkInfo.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Timezone</p>
              <p className="text-sm font-medium">{networkInfo.timezone}</p>
            </div>
          </div>
        </div>

        <div className="my-3 border-t" />

        <div className="flex items-center gap-2">
          <Wifi className="size-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">ISP</p>
            <p className="text-sm font-medium">{networkInfo.isp}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NetworkInfo
