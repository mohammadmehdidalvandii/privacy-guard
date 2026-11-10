import { ShieldCheck, ShieldAlert, Fingerprint } from 'lucide-react'

const checks = [
  {
    id: 'webrtc',
    label: 'WebRTC Leak',
    status: 'protected',
    description: 'No leak detected',
    icon: ShieldCheck,
  },
  {
    id: 'dns',
    label: 'DNS Leak',
    status: 'warning',
    description: 'Not tested yet',
    icon: ShieldAlert,
  },
  {
    id: 'fingerprint',
    label: 'Browser Fingerprinting',
    status: 'warning',
    description: 'Not tested yet',
    icon: Fingerprint,
  },
]

function PrivacyChecks() {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Privacy Checks</h2>

      <div className="space-y-2">
        {checks.map((check) => {
          const Icon = check.icon

          return (
            <div
              key={check.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`size-5 ${
                    check.status === 'protected'
                      ? 'text-green-500'
                      : 'text-yellow-500'
                  }`}
                />

                <div>
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {check.description}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-medium ${
                  check.status === 'protected'
                    ? 'text-green-500'
                    : 'text-yellow-500'
                }`}
              >
                {check.status === 'protected' ? 'Protected' : 'Pending'}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PrivacyChecks
