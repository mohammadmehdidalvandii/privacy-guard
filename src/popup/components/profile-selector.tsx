
import { Shield, ShieldCheck, SlidersHorizontal, MapPin } from 'lucide-react'

export type ProtectionProfile =
  | 'basic'
  | 'advanced'
  | 'custom-location'
  | 'strict'

interface ProfileSelectorProps {
  value: ProtectionProfile
  onChange: (profile: ProtectionProfile) => void
}

const profiles = [
  {
    value: 'basic',
    label: 'Basic',
    description: 'Essential privacy protection',
    icon: Shield,
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Enhanced privacy protection',
    icon: ShieldCheck,
  },
  {
    value: 'custom-location',
    label: 'Custom Location',
    description: 'Configure your preferred location',
    icon: MapPin,
  },
  {
    value: 'strict',
    label: 'Strict Privacy',
    description: 'Maximum available browser privacy controls',
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

              <span className="text-sm font-medium">
                {profile.label}
              </span>

              <span className="text-xs text-muted-foreground">
                {profile.description}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default ProfileSelector
