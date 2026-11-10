
import { useQuery } from '@tanstack/react-query'
import { Globe, MapPin, Clock, Wifi, RefreshCw } from 'lucide-react'

import { getNetworkInfo } from '@/modules/network/network.service'

function NetworkInfo() {
  const {
    data: networkInfo,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['network-info'],
    queryFn: getNetworkInfo,
    retry: 2,
    staleTime: 60_000,
  })

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Network Information</h2>

        <span className="text-xs text-muted-foreground">
          {isFetching
            ? 'Updating...'
            : networkInfo
              ? 'Live Data'
              : 'Unavailable'}
        </span>
      </div>

      <div className="rounded-lg border p-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-8 animate-pulse rounded bg-muted" />
          </div>
        ) : isError ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-destructive">
              Unable to retrieve network information.
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className="size-3" />
              Try Again
            </button>
          </div>
        ) : networkInfo ? (
          <>
            <div className="flex items-center gap-3">
              <Globe className="size-5 text-primary" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Public IP Address
                </p>
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
                  <p className="text-sm font-medium">
                    {networkInfo.timezone}
                  </p>
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

            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="mt-4 flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`size-3 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh Network Information
            </button>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default NetworkInfo
