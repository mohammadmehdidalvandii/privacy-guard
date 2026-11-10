
import { ShieldCheck, Settings } from 'lucide-react'

function PopupHeader() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-6 text-primary" />

        <div>
          <h1 className="text-sm font-semibold">Privacy Guard</h1>
          <p className="text-xs text-muted-foreground">
            Browser Privacy Protection
          </p>
        </div>
      </div>

      <button
        type="button"
        className="rounded-md p-2 transition-colors hover:bg-muted"
        aria-label="Settings"
      >
        <Settings className="size-5" />
      </button>
    </header>
  )
}

export default PopupHeader
