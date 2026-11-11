import {
  MapPin,
  Radio,
  Fingerprint,
  Globe,
  Cookie,
  ShieldCheck,
} from "lucide-react";

import type { ProtectionControlStatus } from "@/modules/protection/protection.types";

interface ProtectionOverviewProps {
  controls: ProtectionControlStatus | null;
}

function ProtectionOverview({ controls }: ProtectionOverviewProps) {
  const webRTCStatus = controls
    ? controls.webRTCProtection === "default"
      ? "Default"
      : controls.webRTCProtection === "public-only"
        ? "Protected"
        : "Enhanced"
    : "Unknown";

  const cookieStatus = controls
    ? controls.blockThirdPartyCookies
      ? "Blocked"
      : "Allowed"
    : "Unknown";

  const geolocationStatus = controls
    ? controls.geolocation === "block"
      ? "Blocked"
      : controls.geolocation === "ask"
        ? "Ask"
        : "Allowed"
    : "Unknown";

  const activeCount = controls
    ? Number(controls.webRTCProtection !== "default") +
      Number(controls.blockThirdPartyCookies) +
      Number(controls.geolocation === "block")
    : null;

  const protectionItems = [
    {
      key: "location",
      label: "Geolocation Protection",
      description: "Control website access to device location",
      status: geolocationStatus,
      statusClass:
        geolocationStatus === "Blocked"
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : geolocationStatus === "Ask"
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : geolocationStatus === "Allowed"
              ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
              : "bg-muted text-muted-foreground",
      icon: MapPin,
    },
    {
      key: "webrtc",
      label: "WebRTC Protection",
      description: "Reduce WebRTC IP exposure",
      status: webRTCStatus,
      statusClass:
        webRTCStatus === "Default"
          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          : webRTCStatus === "Unknown"
            ? "bg-muted text-muted-foreground"
            : "bg-green-500/10 text-green-600 dark:text-green-400",
      icon: Radio,
    },
    {
      key: "fingerprint",
      label: "Fingerprint Protection",
      description: "Fingerprint protection is not implemented yet",
      status: "Not implemented",
      statusClass: "bg-muted text-muted-foreground",
      icon: Fingerprint,
    },
    {
      key: "dns",
      label: "DNS Leak Monitoring",
      description: "DNS leak tests are available on demand",
      status: "On demand",
      statusClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      icon: Globe,
    },
    {
      key: "cookies",
      label: "Third-party Cookies",
      description: "Block third-party cookies",
      status: cookieStatus,
      statusClass:
        cookieStatus === "Blocked"
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : cookieStatus === "Allowed"
            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
            : "bg-muted text-muted-foreground",
      icon: Cookie,
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Protection Status</h2>
        </div>

        <span className="text-xs text-muted-foreground">
          {activeCount === null
            ? "Loading protections..."
            : `${activeCount}/3 active protections`}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border">
        {protectionItems.map((item, index) => {
          const Icon = item.icon;

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
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${item.statusClass}`}
              >
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProtectionOverview;
