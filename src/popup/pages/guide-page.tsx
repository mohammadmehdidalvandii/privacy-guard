
import {
  ArrowLeft,
  Globe,
  Network,
  Shield,
  Fingerprint,
  MapPin,
  Clock,
  Cookie,
  Power,
  ShieldCheck,
} from 'lucide-react'

interface GuidePageProps {
  onBack: () => void
}

const guideSections = [
  {
    icon: Globe,
    title: 'VPN Monitoring',
    description:
      'Monitor your public IP address and VPN connection status. Privacy Guard checks for unexpected IP changes.',
  },
  {
    icon: Network,
    title: 'Network Information',
    description:
      'View your public IP address, network details, and connection information.',
  },
  {
    icon: Shield,
    title: 'WebRTC Protection',
    description:
      'Analyze WebRTC behavior to detect potential IP address leaks through browser communication.',
  },
  {
    icon: Network,
    title: 'DNS Leak Test',
    description:
      'Run a DNS leak test to identify DNS servers that may reveal your actual network location.',
  },
  {
    icon: Fingerprint,
    title: 'Browser Fingerprinting',
    description:
      'Analyze browser characteristics that websites may use to recognize and track your device.',
  },
  {
    icon: MapPin,
    title: 'Geolocation Analysis',
    description:
      'Check whether browser geolocation information matches your expected location.',
  },
  {
    icon: Clock,
    title: 'Timezone Analysis',
    description:
      'Compare your browser timezone with your detected network location for inconsistencies.',
  },
  {
    icon: Cookie,
    title: 'Protection Controls',
    description:
      'Manage WebRTC IP handling, third-party cookies, and browser geolocation permissions.',
  },
  {
    icon: ShieldCheck,
    title: 'Protection Profiles',
    description:
      'Choose a predefined privacy profile or configure a custom location profile.',
  },
  {
    icon: Power,
    title: 'Global Switch',
    description:
      'Pause Privacy Guard monitoring and scans. Browser protection overrides are cleared while paused, and your previous protection settings are restored when enabled again.',
  },
]

function GuidePage({ onBack }: GuidePageProps) {
  return (
    <main className="space-y-5 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md p-2 transition-colors hover:bg-muted"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div>
          <h1 className="text-lg font-semibold">Privacy Guard Guide</h1>
          <p className="text-xs text-muted-foreground">
            Learn how to use Privacy Guard
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-sm leading-6 text-muted-foreground">
          Privacy Guard helps you monitor browser privacy, detect potential
          leaks, and manage built-in browser protection settings.
        </p>
      </div>

      <section className="space-y-3">
        {guideSections.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="flex gap-3 rounded-lg border p-3"
          >
            <div className="mt-0.5 rounded-md bg-muted p-2">
              <Icon className="size-4 text-primary" />
            </div>

            <div className="min-w-0 space-y-1">
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            </div>
          </article>
        ))}
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Privacy Guard v1.0.0
      </p>
    </main>
  )
}

export default GuidePage
