import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  RefreshCw,
  Server,
  ChevronDown,
  Globe,
} from 'lucide-react'

import type {
  DNSLeakResult,
  DNSResolver,
} from '@/modules/dns/dns.types'

interface DNSStatusProps {
  result?: DNSLeakResult
  networkIp?: string
  isLoading: boolean
  error: string | null
  onRunTest: () => void
}

interface ResolverGroup {
  provider: string
  resolvers: DNSResolver[]
  totalQueries: number
}

function groupResolvers(resolvers: DNSResolver[]): ResolverGroup[] {
  const groups = new Map<string, DNSResolver[]>()

  for (const resolver of resolvers) {
    const provider =
      resolver.org || resolver.operator || 'Unknown Provider'

    const group = groups.get(provider) ?? []

    if (!group.some((item) => item.ip === resolver.ip)) {
      group.push(resolver)
    }

    groups.set(provider, group)
  }

  return Array.from(groups, ([provider, items]) => ({
    provider,
    resolvers: items,
    totalQueries: items.reduce(
      (total, resolver) => total + resolver.count,
      0,
    ),
  })).sort((a, b) => b.resolvers.length - a.resolvers.length)
}

function ResolverDetails({ resolver }: { resolver: DNSResolver }) {
  return (
    <div className="space-y-2 rounded-md bg-muted/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Server className="size-4 shrink-0 text-muted-foreground" />

          <div>
            <p className="text-xs font-semibold">{resolver.ip}</p>
            <p className="text-[10px] text-muted-foreground">
              {resolver.role}
            </p>
          </div>
        </div>

        <span className="rounded bg-background px-2 py-1 text-[10px] text-muted-foreground">
          ASN {resolver.asn}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Location</p>
          <p className="font-medium">
            {resolver.city}, {resolver.country}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Operator</p>
          <p className="font-medium">
            {resolver.operator || 'Unknown'}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Transport</p>
          <p className="font-medium">
            {resolver.transport || 'Unknown'}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Queries</p>
          <p className="font-medium">{resolver.count}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded bg-background px-2 py-1 text-[10px]">
          DNSSEC OK bit: {resolver.dnssecOk ? 'Yes' : 'No'}
        </span>

        <span className="rounded bg-background px-2 py-1 text-[10px]">
          Anycast: {resolver.anycast ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  )
}

function ResolverGroupList({
  groups,
}: {
  groups: ResolverGroup[]
}) {
  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <details
          key={group.provider}
          className="group rounded-lg border"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 [&::-webkit-details-marker]:hidden">
            <div className="flex min-w-0 items-center gap-2">
              <Server className="size-4 shrink-0 text-muted-foreground" />

              <span className="truncate text-xs font-semibold">
                {group.provider}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                {group.resolvers.length} IPs
              </span>

              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </div>
          </summary>

          <div className="space-y-2 border-t p-2">
            {group.resolvers.map((resolver) => (
              <ResolverDetails
                key={`${resolver.ip}-${resolver.role}`}
                resolver={resolver}
              />
            ))}

            <p className="px-1 text-right text-[10px] text-muted-foreground">
              {group.totalQueries} Total Queries
            </p>
          </div>
        </details>
      ))}
    </div>
  )
}

function DNSStatus({
  result,
  networkIp,
  isLoading,
  error,
  onRunTest,
}: DNSStatusProps) {
  if (isLoading) {
    return (
      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="size-5 animate-spin text-primary" />

          <div>
            <h3 className="text-sm font-semibold">
              Running DNS Leak Test
            </h3>
            <p className="text-xs text-muted-foreground">
              Checking DNS resolvers...
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (!result) {
    return (
      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <ShieldQuestion className="size-6 text-muted-foreground" />

          <div>
            <h3 className="text-sm font-semibold">DNS Leak Test</h3>
            <p className="text-xs text-muted-foreground">
              {error || 'DNS resolvers have not been tested yet.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRunTest}
          className="w-full rounded-md border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
        >
          Run DNS Leak Test
        </button>
      </section>
    )
  }

  const isLeaking = result.verdict.leaking
  const Icon = isLeaking ? ShieldAlert : ShieldCheck

  const resolvers = result.resolvers.filter(
    (resolver) => resolver.role === 'resolver',
  )

  const observers = result.resolvers.filter(
    (resolver) => resolver.role === 'observer',
  )

  const resolverGroups = groupResolvers(resolvers)
  const observerGroups = groupResolvers(observers)

  const totalResolverIPs = resolverGroups.reduce(
    (total, group) => total + group.resolvers.length,
    0,
  )

  const clientIp = result.client.ip
  const hasNetworkIp = Boolean(
    networkIp && networkIp !== 'Unknown',
  )
  const clientIpMatchesNetwork = hasNetworkIp
    ? clientIp === networkIp
    : null

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div
          className={`rounded-full p-2 ${
            isLeaking
              ? 'bg-yellow-500/10 text-yellow-500'
              : 'bg-green-500/10 text-green-500'
          }`}
        >
          <Icon className="size-6" />
        </div>

        <div>
          <h3 className="text-sm font-semibold">
            {result.verdict.headline}
          </h3>

          <p className="text-xs text-muted-foreground">
            {result.verdict.detail}
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          <p className="text-xs font-semibold">
            DNS Test Client IP
          </p>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground">
            Observed by DNSLeak.dev
          </p>
          <p className="font-mono text-xs font-medium">
            {clientIp}
          </p>
        </div>

        {hasNetworkIp && (
          <>
            <div>
              <p className="text-[10px] text-muted-foreground">
                Network Public IP
              </p>
              <p className="font-mono text-xs font-medium">
                {networkIp}
              </p>
            </div>

            <p className="text-[10px] text-muted-foreground">
              {clientIpMatchesNetwork
                ? 'Both endpoints reported the same IP address.'
                : 'The endpoints reported different IP addresses.'}
            </p>
          </>
        )}

        <p className="text-[10px] text-muted-foreground">
          This comparison is informational and does not independently
          determine whether DNS traffic is leaking.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold">
            Detected DNS Resolvers
          </p>

          <span className="text-xs text-muted-foreground">
            {totalResolverIPs} Resolver IPs
          </span>
        </div>

        {resolverGroups.length > 0 ? (
          <ResolverGroupList groups={resolverGroups} />
        ) : (
          <p className="text-xs text-muted-foreground">
            No DNS resolvers were identified.
          </p>
        )}
      </div>

      {observerGroups.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold">
            Observed DNS Infrastructure
          </p>

          <ResolverGroupList groups={observerGroups} />
        </div>
      )}

      {result.truncated && (
        <p className="text-xs text-yellow-500">
          Some DNS resolver details were omitted by the test service.
        </p>
      )}

      <button
        type="button"
        onClick={onRunTest}
        className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RefreshCw className="size-3" />
        Run Test Again
      </button>
    </section>
  )
}

export default DNSStatus
