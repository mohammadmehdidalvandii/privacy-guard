import { ExternalLink } from 'lucide-react'

function PopupFooter() {
  return (
    <footer className="flex items-center justify-between border-t px-4 py-3">
      <span className="text-xs text-muted-foreground">
        Privacy Guard v1.0.0
      </span>

      <button
        type="button"
        className="flex items-center gap-1 text-xs text-primary transition-opacity hover:opacity-80"
      >
        Open Settings
        <ExternalLink className="size-3" />
      </button>
    </footer>
  )
}

export default PopupFooter
