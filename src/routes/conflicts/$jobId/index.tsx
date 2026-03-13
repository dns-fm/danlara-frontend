import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronDown, ChevronUp, ImageOff } from 'lucide-react'
import { DashboardLayout } from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/auth-context'
import { getJobApi, getJobMatchesApi, type JobItem, type MatchItem } from '../../../lib/api'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Skeleton } from '../../../components/ui/skeleton'
import { cn } from '../../../lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'

export const Route = createFileRoute('/conflicts/$jobId/')({
  component: JobDetailPage,
})

const STATUS_MAP: Record<JobItem['status'], { label: string; className: string }> = {
  P: { label: 'Pending',   className: 'text-muted-foreground border-muted-foreground/30' },
  R: { label: 'Running',   className: 'text-blue-600 border-blue-400/40 dark:text-blue-400' },
  F: { label: 'Finished',  className: 'text-yellow-600 border-yellow-400/40 dark:text-yellow-400' },
  E: { label: 'Failed',    className: 'text-destructive border-destructive/40' },
  C: { label: 'Completed', className: 'text-green-700 border-green-500/40 dark:text-green-400' },
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono tabular-nums">{pct}%</span>
    </div>
  )
}

function LogoCell({ url, alt }: { url: string | null; alt: string }) {
  if (!url) return <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><ImageOff className="h-4 w-4 text-muted-foreground" /></div>
  return <img src={url} alt={alt} className="w-10 h-10 rounded object-contain bg-muted" />
}

function MatchRow({ match }: { match: MatchItem }) {
  const [expanded, setExpanded] = useState(false)
  const scores = match.extra_scores

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-accent/30"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Brand */}
        <TableCell>
          <div className="flex items-center gap-2">
            <LogoCell url={match.brand.logo_url} alt={match.brand.name ?? ''} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{match.brand.name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{match.brand.nice_class ?? ''}</p>
            </div>
          </div>
        </TableCell>
        {/* Process */}
        <TableCell>
          <div className="flex items-center gap-2">
            <LogoCell url={match.process.logo_url} alt={match.process.name ?? ''} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{match.process.name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">#{match.process.number} · {match.process.nice_classes}</p>
            </div>
          </div>
        </TableCell>
        {/* Score */}
        <TableCell><ScoreBar value={match.final_score} /></TableCell>
        {/* Expand */}
        <TableCell className="w-8 text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </TableCell>
      </TableRow>

      {expanded && scores && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={4} className="py-3 px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2">
              {[
                ['Name', scores.name_score],
                ['Services', scores.services_score],
                ['Image', scores.image_score],
                ['Similarity', scores.similarity],
                ['Rerank', scores.rerank],
              ].map(([label, val]) => val != null && (
                <div key={label as string} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground w-16">{label}</span>
                  <ScoreBar value={val as number} />
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function JobDetailPage() {
  const { jobId } = Route.useParams()
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobApi(token!, jobId),
    enabled: !!token,
  })

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['job-matches', jobId, page],
    queryFn: () => getJobMatchesApi(token!, jobId, { page, page_size: PAGE_SIZE }),
    enabled: !!token && !!job,
  })

  const statusInfo = job ? (STATUS_MAP[job.status] ?? STATUS_MAP.P) : null

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/conflicts" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Jobs
          </Link>
        </div>

        {/* Job summary */}
        {jobLoading ? (
          <div className="space-y-2 mb-6"><Skeleton className="h-7 w-72" /><Skeleton className="h-4 w-48" /></div>
        ) : job && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{job.report_name}</h1>
              <Badge variant="outline" className={cn('text-xs', statusInfo?.className)}>{statusInfo?.label}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">Publication #{job.report_number}</p>
            <div className="flex flex-wrap gap-6 mt-4 text-sm">
              <div><span className="text-muted-foreground">Brands checked</span><p className="font-medium">{job.brands?.toLocaleString() ?? '—'}</p></div>
              <div><span className="text-muted-foreground">Matches found</span><p className="font-medium">{job.matches_number?.toLocaleString() ?? '—'}</p></div>
              {job.matching_config && Object.keys(job.matching_config).length > 0 && (
                <>
                  {(job.matching_config as Record<string, unknown>).min_score != null && (
                    <div><span className="text-muted-foreground">Threshold</span><p className="font-medium font-mono">{String((job.matching_config as Record<string, unknown>).min_score)}</p></div>
                  )}
                  {(job.matching_config as Record<string, unknown>).k != null && (
                    <div><span className="text-muted-foreground">k</span><p className="font-medium font-mono">{String((job.matching_config as Record<string, unknown>).k)}</p></div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Matches table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Your Brand</TableHead>
                <TableHead>Publication Entry</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchesLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-10 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : !matches?.items.length
                  ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        No matches found for this job.
                      </TableCell>
                    </TableRow>
                  )
                  : matches.items.map((m) => <MatchRow key={m.id} match={m} />)
              }
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {matches && matches.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>{matches.total.toLocaleString()} matches · page {page} of {matches.total_pages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === matches.total_pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
