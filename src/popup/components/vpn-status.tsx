import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  ShieldX,
} from 'lucide-react'

import type { VPNStatus as VPNStatusType } from '@/modules/vpn/vpn.types'

interface VPNStatusProps {
  status: VPNStatusType
}

const statusConfig = {
  likely: {
    label: 'VPN Likely Detected',
    description: 'Strong network indicators suggest VPN usage.',
    icon: ShieldCheck,
    className: 'text-green-500 bg-green-500/10',
  },
  possible: {
    label: 'Possible VPN Detected',
    description: 'Some network indicators may suggest VPN usage.',
    icon: ShieldAlert,
    className: 'text-yellow-500 bg-yellow-500/10',
  },
  'not-detected': {
    label: 'No VPN Indicators Detected',
    description: 'No sufficient VPN indicators were found. This does not confirm that VPN is disabled.',
    icon: ShieldX,
    className: 'text-muted-foreground bg-muted',
  },
  unknown: {
    label: 'Status Unknown',
    description: 'Not enough information to analyze your connection.',
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
