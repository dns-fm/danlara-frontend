import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
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
  Plus,
  Upload,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  List,
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
  {
    label: 'My Brands',
    icon: Tag,
    to: '/brands',
    children: [
      { label: 'All Brands', icon: Tag, to: '/brands' },
      { label: 'Add Brand', icon: Plus, to: '/brands/new' },
      { label: 'Upload JSON', icon: Upload, to: '/brands/upload' },
      { label: 'Uploads', icon: FolderOpen, to: '/brands/uploads' },
    ],
  },
  {
    label: 'Third-Party Brands',
    icon: Users,
    to: '/third-party-brands',
    children: [
      { label: 'Publications', icon: FileText, to: '/third-party-brands' },
      { label: 'Trademarks', icon: Stamp, to: '/third-party-brands/trademarks' },
    ],
  },
  {
    label: 'Conflicts',
    icon: AlertTriangle,
    to: '/conflicts',
    children: [
      { label: 'All Jobs', icon: AlertTriangle, to: '/conflicts' },
      { label: 'All Conflicts', icon: List, to: '/conflicts/matches' },
      { label: 'New Job', icon: Plus, to: '/conflicts/new' },
    ],
  },
  { label: 'Account', icon: User, to: '/account' },
]

export interface DashboardSidebarProps {
  user: UserOut
  onLogout: () => void
  isMobileOpen: boolean
  onMobileClose: () => void
}

// Module-level caches — survive remounts caused by DashboardLayout re-mounting on navigation
const _menuCache: Record<string, boolean> = {}
const _collapseCache = { collapsed: false }

export function DashboardSidebar({ user, onLogout, isMobileOpen, onMobileClose }: DashboardSidebarProps) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()

  const [isCollapsed, setIsCollapsed] = useState(() => _collapseCache.collapsed)

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navItems.forEach(({ to, children }) => {
      if (children) {
        initial[to] = to in _menuCache ? _menuCache[to] : currentPath.startsWith(to)
      }
    })
    return initial
  })

  const toggleCollapse = () => {
    const next = !isCollapsed
    _collapseCache.collapsed = next
    setIsCollapsed(next)
  }

  const toggleMenu = (to: string) => setOpenMenus((prev) => {
    const next = { ...prev, [to]: !prev[to] }
    Object.assign(_menuCache, next)
    return next
  })

  const sidebarContent = (collapsed: boolean) => (
    <>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-2 border-b border-sidebar-border flex-shrink-0',
        collapsed ? 'justify-center px-0 py-5' : 'px-6 py-5',
      )}>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-lg font-semibold tracking-tight">Danlara</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map(({ label, icon: Icon, to, children }) => {
          const isGroupActive = to !== '/dashboard' && currentPath.startsWith(to)

          if (children) {
            const isOpen = !collapsed && (openMenus[to] ?? false)
            const groupClassName = cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
              collapsed && 'justify-center px-0',
              isGroupActive
                ? 'text-sidebar-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            )
            return (
              <div key={to}>
                {collapsed ? (
                  <Link to={to} title={label} className={groupClassName}>
                    <Icon className="h-4 w-4 flex-shrink-0" />
                  </Link>
                ) : (
                <button
                  type="button"
                  onClick={() => toggleMenu(to)}
                  className={groupClassName}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{label}</span>
                      <ChevronRight
                        className={cn(
                          'h-3.5 w-3.5 transition-transform text-sidebar-foreground/40',
                          isOpen && 'rotate-90',
                        )}
                      />
                    </>
                  )}
                </button>
                )}
                {isOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                    {children.map(({ label: childLabel, icon: ChildIcon, to: childTo }) => {
                      const isChildActive =
                        childTo === '/third-party-brands'
                          ? currentPath === childTo || (currentPath.startsWith(childTo + '/') && !currentPath.startsWith('/third-party-brands/trademarks'))
                          : childTo === '/brands'
                            ? currentPath === childTo || (currentPath.startsWith('/brands/') && !currentPath.startsWith('/brands/new') && !currentPath.startsWith('/brands/upload') && !currentPath.startsWith('/brands/uploads'))
                            : childTo === '/conflicts'
                              ? currentPath === childTo || (currentPath.startsWith('/conflicts/') && !currentPath.startsWith('/conflicts/matches') && !currentPath.startsWith('/conflicts/new'))
                              : childTo === '/conflicts/matches'
                                ? currentPath === childTo || currentPath.startsWith('/conflicts/matches/')
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
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden lg:flex border-t border-sidebar-border px-2 py-2 justify-end">
        <button
          type="button"
          onClick={toggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center rounded-md p-1.5 text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* User footer */}
      <div className={cn('border-t border-sidebar-border px-3 py-3', collapsed && 'flex justify-center')}>
        {collapsed ? (
          <Avatar className="h-8 w-8" title={`${user.first_name} ${user.last_name}`}>
            <AvatarImage src={user.avatar ?? undefined} alt={user.first_name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-200 lg:hidden',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <button
          type="button"
          onClick={onMobileClose}
          className="absolute right-3 top-3 rounded-md p-1 text-sidebar-foreground/50 hover:text-sidebar-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebarContent(false)}
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col h-screen flex-shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-64',
      )}>
        {sidebarContent(isCollapsed)}
      </aside>
    </>
  )
}
