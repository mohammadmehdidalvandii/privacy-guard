import { Shield, ShieldCheck, SlidersHorizontal, MapPin } from 'lucide-react'

import {
  PROFILE_CONFIGS,
  type ProtectionProfile,
} from '@/modules/profiles/profile.types'

interface ProfileSelectorProps {
  value: ProtectionProfile
  onChange: (profile: ProtectionProfile) => void
}

const profiles = [
  {
    value: 'basic',
    icon: Shield,
  },
  {
    value: 'advanced',
    icon: ShieldCheck,
  },
  {
    value: 'custom-location',
    icon: MapPin,
  },
  {
    value: 'strict',
    icon: SlidersHorizontal,
  },
] as const

function ProfileSelector({ value, onChange }: ProfileSelectorProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Protection Profile</h2>

      <div className="grid grid-cols-2 gap-2">
        {profiles.map((profile) => {
          const Icon = profile.icon
          const isActive = value === profile.value
          const config = PROFILE_CONFIGS[profile.value]

          return (
            <button
              key={profile.value}
              type="button"
              onClick={() => onChange(profile.value)}
              className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors ${
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted'
              }`}
            >
              <Icon className="size-5" />

              <span className="text-sm font-medium">{config.label}</span>

              <span className="text-xs text-muted-foreground">
                {config.description}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default ProfileSelector
