import {
  ArrowLeft,
  Bell,
  MapPin,
  RotateCcw,
  X,
} from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { COUNTRY_OPTIONS } from '@/modules/profiles/country-options'

import type {
  ProtectionControlStatus,
  WebRTCProtectionLevel,
} from '@/modules/protection/protection.types'

import ProtectionControls from '@/popup/components/protection-controls'

interface SettingsPageProps {
  onBack: () => void
  notifications: boolean
  locationProtection: boolean
  privacyProtection: boolean
  isCustomLocation: boolean
  expectedCountryCode: string | null
  protectionControls: ProtectionControlStatus | null
  isProtectionLoading: boolean
  protectionError: string | null
  onNotificationsChange: (checked: boolean) => void
  onLocationProtectionChange: (checked: boolean) => void
  onPrivacyProtectionChange: (checked: boolean) => void
  onExpectedCountryChange: (countryCode: string | null) => void
  onWebRTCChange: (value: WebRTCProtectionLevel) => void
  onThirdPartyCookiesChange: (checked: boolean) => void
  onReset: () => void
}

interface SettingToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </div>
  )
}

function SettingsPage({
  onBack,
  notifications,
  locationProtection,
  privacyProtection,
  isCustomLocation,
  expectedCountryCode,
  protectionControls,
  isProtectionLoading,
  protectionError,
  onNotificationsChange,
  onLocationProtectionChange,
  onPrivacyProtectionChange,
  onExpectedCountryChange,
  onWebRTCChange,
  onThirdPartyCookiesChange,
  onReset,
}: SettingsPageProps) {
  const selectedCountry = COUNTRY_OPTIONS.find(
    (country) => country.code === expectedCountryCode,
  )

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
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-xs text-muted-foreground">
            Manage your privacy preferences
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="size-4" />
          General
        </h2>

        <SettingToggle
          label="Notifications"
          description="Receive privacy alerts"
          checked={notifications}
          onChange={onNotificationsChange}
        />

        <SettingToggle
          label="Location Protection"
          description="Manage location privacy"
          checked={locationProtection}
          onChange={onLocationProtectionChange}
        />

        <SettingToggle
          label="Privacy Protection"
          description="Enable privacy protection controls"
          checked={privacyProtection}
          onChange={onPrivacyProtectionChange}
        />
      </section>

      {isCustomLocation && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="size-4" />
            Custom Location
          </h2>

          <div className="space-y-2 rounded-lg border p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Expected Country</p>
              <p className="text-xs text-muted-foreground">
                Select the country you expect your VPN connection to use.
              </p>
            </div>

            <Select
              value={expectedCountryCode ?? ''}
              onValueChange={(value) =>
                onExpectedCountryChange(value || null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a country">
                  {selectedCountry?.name}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {COUNTRY_OPTIONS.map((country) => (
                  <SelectItem
                    key={country.code}
                    value={country.code}
                  >
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {expectedCountryCode && (
              <button
                type="button"
                onClick={() => onExpectedCountryChange(null)}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3" />
                Clear selection
              </button>
            )}
          </div>
        </section>
      )}

      <section className="space-y-3">
        {isProtectionLoading ? (
          <p className="text-xs text-muted-foreground">
            Loading browser protection settings...
          </p>
        ) : protectionError ? (
          <p className="rounded-lg border p-3 text-xs text-destructive">
            {protectionError}
          </p>
        ) : protectionControls ? (
          <ProtectionControls
            controls={protectionControls}
            onWebRTCChange={onWebRTCChange}
            onThirdPartyCookiesChange={onThirdPartyCookiesChange}
          />
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Advanced</h2>

        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"
        >
          <RotateCcw className="size-5 text-muted-foreground" />

          <div>
            <p className="text-sm font-medium">Reset Settings</p>
            <p className="text-xs text-muted-foreground">
              Restore default preferences
            </p>
          </div>
        </button>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Privacy Guard v1.0.0
      </p>
    </main>
  )
}

export default SettingsPage
