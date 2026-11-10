
import type { ReactNode } from 'react'

interface PopupLayoutProps {
  children: ReactNode
}

function PopupLayout({ children }: PopupLayoutProps) {
  return (
    <main className="flex min-h-screen w-95 flex-col bg-background text-foreground">
      {children}
    </main>
  )
}

export default PopupLayout
