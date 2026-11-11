
import { BookOpen, ShieldCheck, Settings } from 'lucide-react'

import { Switch } from '@/components/ui/switch'

interface PopupHeaderProps {
  enabled: boolean
  isLoading: boolean
  onEnabledChange: (enabled: boolean) => void
  onSettingsClick: () => void
  onGuideClick: () => void
}

function PopupHeader({
  enabled,
  isLoading,
  onEnabledChange,
  onSettingsClick,
  onGuideClick,
}: PopupHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-6 text-primary" />

        <div>
          <h1 className="text-sm font-semibold">Privacy Guard</h1>
          <p className="text-xs text-muted-foreground">
            {enabled ? 'Browser Privacy Protection' : 'Protection Paused'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={isLoading}
          aria-label="Enable or disable Privacy Guard"
        />

        <button
          type="button"
          onClick={onGuideClick}
          className="rounded-md p-2 transition-colors hover:bg-muted"
          aria-label="Guide"
          title="Guide"
        >
          <BookOpen className="size-5" />
        </button>

        <button
          type="button"
          onClick={onSettingsClick}
          className="rounded-md p-2 transition-colors hover:bg-muted"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  )
}

export default PopupHeader
