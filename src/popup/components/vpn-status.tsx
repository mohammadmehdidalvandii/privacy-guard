
import { ShieldCheck, ShieldAlert } from 'lucide-react'

type VPNStatusType = 'connected' | 'disconnected' | 'unknown'

interface VPNStatusProps {
  status?: VPNStatusType
}

function VPNStatus({ status = 'unknown' }: VPNStatusProps) {
  const statusConfig = {
    connected: {
      label: 'VPN Connected',
      description: 'Your VPN connection is active.',
      icon: ShieldCheck,
      className: 'text-green-500 bg-green-500/10',
    },
    disconnected: {
      label: 'VPN Disconnected',
      description: 'Your VPN connection is not active.',
      icon: ShieldAlert,
      className: 'text-red-500 bg-red-500/10',
    },
    unknown: {
      label: 'Status Unknown',
      description: 'Unable to determine VPN status.',
      icon: ShieldAlert,
      className: 'text-yellow-500 bg-yellow-500/10',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <section className="flex items-center gap-3 rounded-lg border p-4">
      <div className={`rounded-full p-2 ${config.className}`}>
        <Icon className="size-6" />
      </div>

      <div>
        <h2 className="text-sm font-semibold">{config.label}</h2>
        <p className="text-xs text-muted-foreground">
          {config.description}
        </p>
      </div>
    </section>
  )
}

export default VPNStatus
