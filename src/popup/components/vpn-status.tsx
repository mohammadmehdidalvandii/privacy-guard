import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'

import type { VPNStatus as VPNStatusType } from '@/modules/vpn/vpn.types'

interface VPNStatusProps {
  status: VPNStatusType
}

const statusConfig = {
  possible: {
    label: 'Possible VPN Detected',
    description: 'Your public IP address has changed.',
    icon: ShieldCheck,
    className: 'text-green-500 bg-green-500/10',
  },
  unchanged: {
    label: 'No IP Change Detected',
    description: 'Your public IP address has not changed.',
    icon: ShieldAlert,
    className: 'text-yellow-500 bg-yellow-500/10',
  },
  unknown: {
    label: 'Status Unknown',
    description: 'Not enough information to determine network changes.',
    icon: ShieldQuestion,
    className: 'text-muted-foreground bg-muted',
  },
} satisfies Record<
  VPNStatusType,
  {
    label: string
    description: string
    icon: typeof ShieldCheck
    className: string
  }
>

function VPNStatus({ status }: VPNStatusProps) {
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
