import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Tag,
  Briefcase,
  AlertTriangle,
  Globe,
  Upload,
  Search,
  BarChart3,
  Settings,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Separator } from '../../components/ui/separator'
import { DashboardLayout } from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth-context'
import {
  getSubscriptionApi,
  getDashboardStatsApi,
  type SubscriptionOut,
  type DashboardStats,
} from '../../lib/api'

export const Route = createFileRoute('/dashboard/')({
  component: LayoutPage,
})

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: number | undefined
  icon: React.ElementType
  loading: boolean
}

function StatCard({ title, value, icon: Icon, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────

const quickActions = [
  { label: 'Upload Brands', description: 'Import a brand JSON file', icon: Upload, href: '/brands' },
  { label: 'Run Job Search', description: 'Start a new matching job', icon: Search, href: '/jobs' },
  { label: 'View Conflicts', description: 'Review detected conflicts', icon: AlertTriangle, href: '/conflicts' },
  { label: 'Billing Settings', description: 'Manage your subscription', icon: Settings, href: '/billing' },
]

function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {quickActions.map(({ label, description, icon: Icon, href }) => (
        <Card
          key={label}
          className="cursor-pointer transition-colors hover:bg-accent/50"
          onClick={() => window.location.assign(href)}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Recent Activity ──────────────────────────────────────────────────────────

const placeholderActivity = [
  { id: 1, text: 'New brand "Acme Corp" uploaded', time: '2 hours ago', icon: Upload },
  { id: 2, text: 'Job search completed — 12 matches found', time: '5 hours ago', icon: BarChart3 },
  { id: 3, text: 'Conflict detected for "Alpha Brand"', time: '1 day ago', icon: AlertTriangle },
]

function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {placeholderActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent activity.</p>
        ) : (
          <ul className="space-y-4">
            {placeholderActivity.map((item, i) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted flex-shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                  {i < placeholderActivity.length - 1 && <Separator className="mt-4" />}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Your Plan ────────────────────────────────────────────────────────────────

function YourPlan({ subscription, loading }: { subscription: SubscriptionOut | undefined; loading: boolean }) {
  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    incomplete: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    canceled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    past_due: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : subscription ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xl font-semibold">{subscription.plan.name}</span>
              <Badge className={statusColor[subscription.status] ?? ''} variant="outline">
                {subscription.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">
                  {(subscription.plan.amount / 100).toLocaleString(undefined, {
                    style: 'currency',
                    currency: subscription.plan.currency.toUpperCase(),
                  })}
                </span>
                {' '}/ {subscription.plan.interval}
              </p>
              {subscription.current_period_end && (
                <p>Renews {formatDate(subscription.current_period_end)}</p>
              )}
              {subscription.trial_end && (
                <p>Trial ends {formatDate(subscription.trial_end)}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.assign('/billing')}>
              Manage Billing
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">No active subscription.</p>
            <Button size="sm" onClick={() => window.location.assign('/register')}>
              Choose a Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function LayoutPage() {
  const { token, user } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStatsApi(token!),
    enabled: !!token,
  })

  const { data: subscription, isLoading: subLoading } = useQuery<SubscriptionOut>({
    queryKey: ['subscription'],
    queryFn: () => getSubscriptionApi(token!),
    enabled: !!token,
    retry: false,
  })

  const statCards = [
    { title: 'Total Brands', value: stats?.total_brands, icon: Tag },
    { title: 'Active Jobs', value: stats?.active_jobs, icon: Briefcase },
    { title: 'Conflicts Found', value: stats?.conflicts_found, icon: AlertTriangle },
    { title: 'Monitored Markets', value: stats?.monitored_markets, icon: Globe },
  ]

  return (
    <DashboardLayout>
      <div className="px-8 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.first_name}. Here's what's happening with your brands.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
          {statCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              loading={statsLoading}
            />
          ))}
        </div>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <QuickActions />
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <RecentActivity />
          <YourPlan subscription={subscription} loading={subLoading} />
        </div>
      </div>
    </DashboardLayout>
  )
}
