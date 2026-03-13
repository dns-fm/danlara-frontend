import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { DashboardLayout } from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/auth-context'
import { getConflictMatchesApi, type ConflictMatch } from '../../../lib/api'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Skeleton } from '../../../components/ui/skeleton'
import { cn } from '../../../lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'

export const Route = createFileRoute('/conflicts/matches/')({
  component: ConflictMatchesPage,
})

const PAGE_SIZE = 50

function ScoreBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono tabular-nums">{pct}%</span>
    </div>
  )
}

function LogoThumb({ url, alt }: { url: string | null; alt: string }) {
  if (!url) {
    return (
      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
        <ImageOff className="h-3 w-3 text-muted-foreground" />
      </div>
    )
  }
  return <img src={url} alt={alt} className="w-8 h-8 rounded object-contain bg-muted flex-shrink-0" />
}

function ConflictMatchesPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [reviewedFilter, setReviewedFilter] = useState<'all' | 'reviewed' | 'unreviewed'>('all')
  const [confirmedFilter, setConfirmedFilter] = useState<'all' | 'confirmed' | 'dismissed'>('all')

  const reviewed = reviewedFilter === 'reviewed' ? true : reviewedFilter === 'unreviewed' ? false : undefined
  const confirmed = confirmedFilter === 'confirmed' ? true : confirmedFilter === 'dismissed' ? false : undefined

  const { data, isLoading } = useQuery({
    queryKey: ['conflict-matches', page, search, reviewedFilter, confirmedFilter],
    queryFn: () => getConflictMatchesApi(token!, { page, page_size: PAGE_SIZE, search: search || undefined, reviewed, confirmed }),
    enabled: !!token,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All Conflicts</h1>
            <p className="text-muted-foreground mt-1">Brand matches across all conflict analysis jobs.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48 max-w-md">
            <Input
              placeholder="Search brand or trademark name…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Select value={reviewedFilter} onValueChange={(v) => { setReviewedFilter(v as typeof reviewedFilter); setPage(1) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reviews</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="unreviewed">Unreviewed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={confirmedFilter} onValueChange={(v) => { setConfirmedFilter(v as typeof confirmedFilter); setPage(1) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All results</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Your Brand</TableHead>
                <TableHead>Publication Entry</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : !data?.items.length
                  ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No conflicts found.
                      </TableCell>
                    </TableRow>
                  )
                  : data.items.map((m: ConflictMatch) => (
                    <TableRow
                      key={m.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => navigate({ to: '/conflicts/matches/$matchId', params: { matchId: String(m.id) } })}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <LogoThumb url={m.brand.logo_url} alt={m.brand.name ?? ''} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{m.brand.name ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{m.brand.nice_class ?? ''}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <LogoThumb url={m.process.logo_url} alt={m.process.name ?? ''} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{m.process.name ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">#{m.process.number}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><ScoreBar value={m.final_score} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <p className="truncate max-w-[140px]">{m.job.report_name}</p>
                        <p>#{m.job.report_number}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {m.reviewed ? (
                            <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">Reviewed</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-400/40">Pending</Badge>
                          )}
                          {m.reviewed && (
                            m.confirmed
                              ? <Badge variant="outline" className="text-xs text-red-600 border-red-400/40">Conflict</Badge>
                              : <Badge variant="outline" className="text-xs text-green-700 border-green-400/40">Dismissed</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </div>

        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {data.total.toLocaleString()} matches — page {data.page} of {data.total_pages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
