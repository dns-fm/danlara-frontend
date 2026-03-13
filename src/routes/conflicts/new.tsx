import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Search, FileText, Loader2, Settings2 } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth-context'
import { searchPublicationsApi, createJobApi, type ReportSearchItem, ApiError } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { cn } from '../../lib/utils'

export const Route = createFileRoute('/conflicts/new')({
  component: NewJobPage,
})

const DEFAULT_MIN_SCORE = 0.75
const DEFAULT_K = 10

function NewJobPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ReportSearchItem | null>(null)
  const [minScore, setMinScore] = useState(DEFAULT_MIN_SCORE)
  const [k, setK] = useState(DEFAULT_K)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: results = [], isFetching, error: searchError, refetch } = useQuery({
    queryKey: ['publication-search', query],
    queryFn: () => searchPublicationsApi(token!, query || undefined),
    enabled: !!token,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSelected(null)
    refetch()
  }

  const createMutation = useMutation({
    mutationFn: () => createJobApi(token!, selected!.id, { min_score: minScore, k }),
    onSuccess: () => navigate({ to: '/conflicts' }),
    onError: (err) => setSubmitError(err instanceof ApiError ? err.detail : 'Failed to create job.'),
  })

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null

  return (
    <DashboardLayout>
      <div className="px-8 py-8 max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/conflicts" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Jobs
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">New Conflict Job</h1>
          <p className="text-muted-foreground mt-1">Search for a publication and run a conflict analysis against your brands.</p>
        </div>

        {/* Publication search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-2">
          <Input
            placeholder="Search by publication name or number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline" disabled={isFetching}>
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>

        {searchError && (
          <p className="text-sm text-destructive mb-3">
            {searchError instanceof ApiError ? searchError.detail : 'Search failed.'}
          </p>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="rounded-lg border divide-y mb-6">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors',
                  selected?.id === r.id && 'bg-accent',
                )}
              >
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    #{r.number}{formatDate(r.publication_date) && ` · ${formatDate(r.publication_date)}`}
                  </p>
                </div>
                {selected?.id === r.id && (
                  <span className="text-xs text-primary font-medium">Selected</span>
                )}
              </button>
            ))}
          </div>
        )}

        {results.length === 0 && !isFetching && query && (
          <p className="text-sm text-muted-foreground mb-6">No publications found for "{query}".</p>
        )}

        {/* Configuration */}
        <div className="rounded-lg border p-4 mb-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Analysis Parameters
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="min-score" className="text-sm">
                Similarity threshold
              </Label>
              <span className="text-sm font-mono text-muted-foreground">{minScore.toFixed(2)}</span>
            </div>
            <input
              id="min-score"
              type="range"
              min={0.1}
              max={1}
              step={0.01}
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">Minimum score to consider a brand a potential conflict. Higher = fewer, more precise matches.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="k" className="text-sm">Candidates per brand (k)</Label>
            <Input
              id="k"
              type="number"
              min={1}
              max={100}
              value={k}
              onChange={(e) => setK(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">Number of publication entries retrieved from the database per brand for scoring.</p>
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-destructive mb-4">{submitError}</p>
        )}

        <Button
          disabled={!selected || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Run conflict analysis
        </Button>
      </div>
    </DashboardLayout>
  )
}
