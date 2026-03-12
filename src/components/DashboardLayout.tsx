import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { useAuth } from '../lib/auth-context'
import { DashboardSidebar } from './DashboardSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, token, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !token) {
      navigate({ to: '/login' })
    }
  }, [isLoading, token, navigate])

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        user={user}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold">Danlara</span>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
