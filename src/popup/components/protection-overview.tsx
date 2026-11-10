import {
  MapPin,
  Radio,
  Fingerprint,
  Globe,
  Cookie,
  ShieldCheck,
} from "lucide-react";

import type { ProtectionProfileConfig } from "@/modules/profiles/profile.types";

interface ProtectionOverviewProps {
  config: ProtectionProfileConfig;
}

const protectionItems = [
  {
    key: "locationProtection",
    label: "Location Protection",
    description: "Protect location information",
    icon: MapPin,
  },
  {
    key: "webrtcProtection",
    label: "WebRTC Protection",
    description: "Reduce WebRTC IP exposure",
    icon: Radio,
  },
  {
    key: "fingerprintProtection",
    label: "Fingerprint Protection",
    description: "Limit browser fingerprinting",
    icon: Fingerprint,
  },
  {
    key: "dnsLeakMonitoring",
    label: "DNS Leak Monitoring",
    description: "Monitor potential DNS leaks",
    icon: Globe,
  },
  {
    key: "blockThirdPartyCookies",
    label: "Third-party Cookies",
    description: "Block third-party cookies",
    icon: Cookie,
  },
] as const;

function ProtectionOverview({ config }: ProtectionOverviewProps) {
  const activeCount = Object.values(config).filter(Boolean).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Active Protection</h2>
        </div>

        <span className="text-xs text-muted-foreground">
          {activeCount}/{protectionItems.length} enabled
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border">
        {protectionItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = config[item.key];

          return (
            <div
              key={item.key}
              className={`flex items-center justify-between gap-3 p-3 ${
                index !== protectionItems.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">{item.label}</p>

                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
                  isActive
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {isActive ? "Enabled" : "Disabled"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProtectionOverview;
