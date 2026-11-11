import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
} from 'lucide-react'

import type { WebRTCAnalysis } from '@/modules/webrtc/webrtc.types'

interface WebRTCStatusProps {
  analysis?: WebRTCAnalysis
  isLoading: boolean
  error: string | null
}

function WebRTCStatus({
  analysis,
  isLoading,
  error,
}: WebRTCStatusProps) {
  if (isLoading) {
    return (
      <section className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Checking WebRTC...
        </p>
      </section>
    )
  }

  if (error || !analysis || analysis.status === 'unknown') {
    return (
      <section className="flex items-center gap-3 rounded-lg border p-4">
        <ShieldQuestion className="size-6 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-semibold">
            WebRTC Status Unknown
          </h3>
          <p className="text-xs text-muted-foreground">
            {error || 'WebRTC analysis is unavailable.'}
          </p>
        </div>
      </section>
    )
  }

  const config = {
    'ip-mismatch': {
      label: 'WebRTC IP Mismatch',
      description:
        'WebRTC and network requests use different public IP addresses. This does not necessarily indicate a leak.',
      icon: ShieldAlert,
      className: 'text-yellow-500 bg-yellow-500/10',
    },
    'no-leak-detected': {
      label: 'No IP Mismatch Detected',
      description:
        'No difference was found between comparable public IP addresses.',
      icon: ShieldCheck,
      className: 'text-green-500 bg-green-500/10',
    },
    unavailable: {
      label: 'WebRTC Check Unavailable',
      description:
        'No comparable public ICE candidate could be inspected.',
      icon: ShieldQuestion,
      className: 'text-muted-foreground bg-muted',
    },
  }[analysis.status]

  const Icon = config.icon

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-2 ${config.className}`}>
          <Icon className="size-6" />
        </div>

        <div>
          <h3 className="text-sm font-semibold">{config.label}</h3>
          <p className="text-xs text-muted-foreground">
            {config.description}
          </p>
        </div>
      </div>

      {analysis.publicIps.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium">Public IPs</p>

          {analysis.publicIps.map((ip) => (
            <p
              key={ip}
              className="font-mono text-xs text-muted-foreground"
            >
              {ip}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}

export default WebRTCStatus
