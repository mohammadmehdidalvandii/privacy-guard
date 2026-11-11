import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Fingerprint,
} from 'lucide-react'

import type { WebRTCAnalysis } from '@/modules/webrtc/webrtc.types'
import type { DNSLeakResult } from '@/modules/dns/dns.types'

interface PrivacyChecksProps {
  webRTCAnalysis?: WebRTCAnalysis
  isWebRTCLoading: boolean
  webRTCError: string | null
  dnsResult?: DNSLeakResult
  isDNSLoading: boolean
  dnsError: string | null
}

function PrivacyChecks({
  webRTCAnalysis,
  isWebRTCLoading,
  webRTCError,
  dnsResult,
  isDNSLoading,
  dnsError,
}: PrivacyChecksProps) {
  const webRTCCheck = (() => {
    if (isWebRTCLoading) {
      return {
        description: 'Checking WebRTC...',
        status: 'checking',
      }
    }

    if (webRTCError || !webRTCAnalysis) {
      return {
        description: 'WebRTC check unavailable',
        status: 'unknown',
      }
    }

    switch (webRTCAnalysis.status) {
      case 'no-leak-detected':
        return {
          description: 'No IP mismatch detected',
          status: 'protected',
        }

      case 'ip-mismatch':
        return {
          description: 'Public IP mismatch detected',
          status: 'warning',
        }

      case 'unavailable':
      case 'unknown':
        return {
          description: 'WebRTC check unavailable',
          status: 'unknown',
        }
    }
  })()

  const dnsCheck = (() => {
    if (isDNSLoading) {
      return {
        description: 'Checking DNS resolvers...',
        status: 'checking',
      }
    }

    if (dnsError) {
      return {
        description: 'DNS test failed',
        status: 'unknown',
      }
    }

    if (!dnsResult) {
      return {
        description: 'Not tested yet',
        status: 'pending',
      }
    }

    return dnsResult.verdict.leaking
      ? {
          description: 'Potential DNS leak detected',
          status: 'warning',
        }
      : {
          description: 'No DNS leak detected',
          status: 'protected',
        }
  })()

  const checks = [
    {
      id: 'webrtc',
      label: 'WebRTC Leak',
      ...webRTCCheck,
    },
    {
      id: 'dns',
      label: 'DNS Leak',
      ...dnsCheck,
    },
    {
      id: 'fingerprint',
      label: 'Browser Fingerprinting',
      description: 'Not tested yet',
      status: 'pending',
    },
  ]

  const statusConfig = {
    protected: {
      label: 'Protected',
      icon: ShieldCheck,
      className: 'text-green-500',
    },
    warning: {
      label: 'Warning',
      icon: ShieldAlert,
      className: 'text-yellow-500',
    },
    checking: {
      label: 'Checking',
      icon: ShieldQuestion,
      className: 'text-blue-500',
    },
    unknown: {
      label: 'Unknown',
      icon: ShieldQuestion,
      className: 'text-muted-foreground',
    },
    pending: {
      label: 'Pending',
      icon: Fingerprint,
      className: 'text-muted-foreground',
    },
  } as const

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Privacy Checks</h2>

      <div className="space-y-2">
        {checks.map((check) => {
          const config =
            statusConfig[
              check.status as keyof typeof statusConfig
            ]

          const Icon = config.icon

          return (
            <div
              key={check.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Icon className={`size-5 ${config.className}`} />

                <div>
                  <p className="text-sm font-medium">
                    {check.label}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {check.description}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-medium ${config.className}`}
              >
                {config.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PrivacyChecks
