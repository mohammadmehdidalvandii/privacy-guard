
import { ArrowLeft, Bell, Shield, Globe, RotateCcw } from 'lucide-react'

interface SettingsPageProps {
  onBack: () => void
}

function SettingsPage({ onBack }: SettingsPageProps) {
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
        <h2 className="text-sm font-semibold">General</h2>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Bell className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Notifications</p>
            <p className="text-xs text-muted-foreground">
              Manage privacy alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Globe className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Location Settings</p>
            <p className="text-xs text-muted-foreground">
              Manage location privacy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Shield className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Privacy Protection</p>
            <p className="text-xs text-muted-foreground">
              Configure protection behavior
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Advanced</h2>

        <button
          type="button"
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
