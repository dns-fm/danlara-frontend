import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  CreditCard,
  Tag,
  Users,
  AlertTriangle,
  User,
  LogOut,
  Shield,
  ChevronRight,
  FileText,
  Stamp,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import type { UserOut } from '../lib/api'

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  children?: { label: string; icon: React.ElementType; to: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Billing', icon: CreditCard, to: '/billing' },
  { label: 'My Brands', icon: Tag, to: '/brands' },
  {
    label: 'Third-Party Brands',
    icon: Users,
    to: '/third-party-brands',
    children: [
      { label: 'Publications', icon: FileText, to: '/third-party-brands' },
      { label: 'Trademarks', icon: Stamp, to: '/third-party-brands/trademarks' },
    ],
  },
  { label: 'Conflicts', icon: AlertTriangle, to: '/conflicts' },
  { label: 'Account', icon: User, to: '/account' },
]

interface DashboardSidebarProps {
  user: UserOut
  onLogout: () => void
}

export function DashboardSidebar({ user, onLogout }: DashboardSidebarProps) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Danlara</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ label, icon: Icon, to, children }) => {
          const isGroupActive = to !== '/dashboard' && currentPath.startsWith(to)
          const isExactActive = currentPath === to

          if (children) {
            const isOpen = isGroupActive
            return (
              <div key={to}>
                {/* Parent item — not a link, just a label that expands */}
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                    isOpen
                      ? 'text-sidebar-foreground'
                      : 'text-sidebar-foreground/70',
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 transition-transform text-sidebar-foreground/40',
                      isOpen && 'rotate-90',
                    )}
                  />
                </div>
                {/* Children */}
                {isOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                    {children.map(({ label: childLabel, icon: ChildIcon, to: childTo }) => {
                      const isChildActive =
                        childTo === '/third-party-brands'
                          ? currentPath === childTo || (currentPath.startsWith(childTo + '/') && !currentPath.startsWith('/third-party-brands/trademarks'))
                          : currentPath === childTo || currentPath.startsWith(childTo + '/')
                      return (
                        <Link
                          key={childTo}
                          to={childTo}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                            isChildActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                              : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                          )}
                        >
                          <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" />
                          {childLabel}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const isActive = currentPath === to || (to !== '/dashboard' && currentPath.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar ?? undefined} alt={user.first_name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user.first_name} {user.last_name}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
