import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth-context'
import { getJobsApi, type JobItem } from '../../lib/api'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { cn } from '../../lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

export const Route = createFileRoute('/conflicts/')({
  component: ConflictsPage,
})

const STATUS_MAP: Record<JobItem['status'], { label: string; className: string }> = {
  P: { label: 'Pending',    className: 'text-muted-foreground border-muted-foreground/30' },
  R: { label: 'Running',    className: 'text-blue-600 border-blue-400/40 dark:text-blue-400' },
  F: { label: 'Finished',   className: 'text-yellow-600 border-yellow-400/40 dark:text-yellow-400' },
  E: { label: 'Failed',     className: 'text-destructive border-destructive/40' },
  C: { label: 'Completed',  className: 'text-green-700 border-green-500/40 dark:text-green-400' },
}

function StatusBadge({ status }: { status: JobItem['status'] }) {
  const { label, className } = STATUS_MAP[status] ?? STATUS_MAP.P
  return <Badge variant="outline" className={cn('text-xs', className)}>{label}</Badge>
}

function formatDuration(startedAt: string | null, completedAt: string | null) {
  if (!startedAt || !completedAt) return '—'
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

function ConflictsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobsApi(token!),
    enabled: !!token,
    refetchInterval: (query) => {
      const items = query.state.data
      if (items?.some((j) => j.status === 'P' || j.status === 'R')) return 4000
      return false
    },
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Conflict Jobs</h1>
            <p className="text-muted-foreground mt-1">Conflict analysis runs against your brand portfolio.</p>
          </div>
          <Button size="sm" onClick={() => navigate({ to: '/conflicts/new' })}>
            <Plus className="h-4 w-4 mr-1.5" />
            New job
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publication</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Brands</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : !data?.length
                  ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No jobs yet. Run your first conflict analysis.
                      </TableCell>
                    </TableRow>
                  )
                  : data.map((job) => (
                    <TableRow
                      key={job.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => navigate({ to: '/conflicts/$jobId', params: { jobId: job.id } })}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-sm">{job.report_name}</p>
                          <p className="text-xs text-muted-foreground">#{job.report_number}</p>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={job.status} /></TableCell>
                      <TableCell className="text-sm">
                        {job.brands != null ? job.brands.toLocaleString() : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {job.matches_number != null
                          ? <span className="font-medium">{job.matches_number.toLocaleString()}</span>
                          : <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDuration(job.started_at, job.completed_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(job.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
