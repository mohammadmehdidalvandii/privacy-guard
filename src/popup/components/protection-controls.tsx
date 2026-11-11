import { Cookie, MapPin, Radio } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type {
  GeolocationSetting,
  ProtectionControlStatus,
  WebRTCProtectionLevel,
} from '@/modules/protection/protection.types'

interface ProtectionControlsProps {
  controls: ProtectionControlStatus
  onWebRTCChange: (value: WebRTCProtectionLevel) => void
  onThirdPartyCookiesChange: (checked: boolean) => void
  onGeolocationChange: (value: GeolocationSetting) => void
  disabled?: boolean
}

function ProtectionControls({
  controls,
  onWebRTCChange,
  onThirdPartyCookiesChange,
  onGeolocationChange,
  disabled = false,
}: ProtectionControlsProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Browser Protection</h2>

      <div className="space-y-3 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <Radio className="size-4" />
          <p className="text-sm font-medium">WebRTC Protection</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Control how WebRTC handles network interfaces and IP addresses.
        </p>

        <Select
          value={controls.webRTCProtection}
          onValueChange={(value) =>
            onWebRTCChange(value as WebRTCProtectionLevel)
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="public-only">
              Public Interface Only
            </SelectItem>
            <SelectItem value="disable-non-proxied-udp">
              Disable Non-Proxied UDP
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-4" />
          <p className="text-sm font-medium">Geolocation Access</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Control whether websites can request your device location.
        </p>

        <Select
          value={controls.geolocation}
          onValueChange={(value) =>
            onGeolocationChange(value as GeolocationSetting)
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ask">Ask</SelectItem>
            <SelectItem value="allow">Allow</SelectItem>
            <SelectItem value="block">Block</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <Cookie className="size-4 shrink-0" />

          <div className="space-y-1">
            <p className="text-sm font-medium">
              Block Third-party Cookies
            </p>
            <p className="text-xs text-muted-foreground">
              Prevent third-party sites from setting cookies.
            </p>
          </div>
        </div>

        <Switch
          checked={controls.blockThirdPartyCookies}
          onCheckedChange={onThirdPartyCookiesChange}
          disabled={disabled}
          aria-label="Block third-party cookies"
        />
      </div>
    </section>
  )
}

export default ProtectionControls
