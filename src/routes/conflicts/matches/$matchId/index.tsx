import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ImageOff, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { DashboardLayout } from '../../../../components/DashboardLayout'
import { useAuth } from '../../../../lib/auth-context'
import { getConflictMatchApi, updateConflictMatchApi } from '../../../../lib/api'
import { Badge } from '../../../../components/ui/badge'
import { Button } from '../../../../components/ui/button'
import { Skeleton } from '../../../../components/ui/skeleton'
import { cn } from '../../../../lib/utils'

export const Route = createFileRoute('/conflicts/matches/$matchId/')({
  component: ConflictMatchDetailPage,
})

function ScoreBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground w-24 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-mono tabular-nums w-10 text-right">{pct}%</span>
      </div>
    </div>
  )
}

function LogoCard({ url, alt }: { url: string | null; alt: string }) {
  if (!url) {
    return (
      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
        <ImageOff className="h-6 w-6 text-muted-foreground" />
      </div>
    )
  }
  return <img src={url} alt={alt} className="w-20 h-20 rounded-lg object-contain bg-muted" />
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}

function ConflictMatchDetailPage() {
  const { matchId } = Route.useParams()
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState<string | null>(null)

  const { data: match, isLoading } = useQuery({
    queryKey: ['conflict-match', matchId],
    queryFn: () => getConflictMatchApi(token!, Number(matchId)),
    enabled: !!token,
    onSuccess: (data) => {
      if (notes === null) setNotes(data.notes)
    },
  })

  const mutation = useMutation({
    mutationFn: (payload: { reviewed?: boolean; confirmed?: boolean; is_match?: boolean; notes?: string }) =>
      updateConflictMatchApi(token!, Number(matchId), payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['conflict-match', matchId], updated)
      queryClient.invalidateQueries({ queryKey: ['conflict-matches'] })
      if (notes === null) setNotes(updated.notes)
    },
  })

  const handleAction = (action: 'confirm' | 'dismiss') => {
    mutation.mutate({
      reviewed: true,
      confirmed: action === 'confirm',
      is_match: action === 'confirm',
      ...(notes !== null ? { notes } : {}),
    })
  }

  const handleSaveNotes = () => {
    if (notes !== null) mutation.mutate({ notes })
  }

  const scores = match?.extra_scores

  return (
    <DashboardLayout>
      <div className="px-8 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/conflicts/matches" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            All Conflicts
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : match && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Conflict Review</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Job: {match.job.report_name} #{match.job.report_number}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {match.reviewed ? (
                  match.confirmed
                    ? <Badge variant="outline" className="text-red-600 border-red-400/40">Confirmed Conflict</Badge>
                    : <Badge variant="outline" className="text-green-700 border-green-400/40">Dismissed</Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-400/40">Pending Review</Badge>
                )}
              </div>
            </div>

            {/* Brand vs Process cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand */}
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Brand</p>
                <div className="flex items-start gap-3">
                  <LogoCard url={match.brand.logo_url} alt={match.brand.name ?? ''} />
                  <div className="space-y-2 min-w-0">
                    <InfoRow label="Name" value={match.brand.name} />
                    <InfoRow label="Nice Class" value={match.brand.nice_class} />
                    <InfoRow label="Client" value={match.brand.client} />
                  </div>
                </div>
              </div>

              {/* Process */}
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Publication Entry</p>
                <div className="flex items-start gap-3">
                  <LogoCard url={match.process.logo_url} alt={match.process.name ?? ''} />
                  <div className="space-y-2 min-w-0">
                    <InfoRow label="Name" value={match.process.name} />
                    <InfoRow label="Number" value={`#${match.process.number}`} />
                    <InfoRow label="Nature" value={match.process.nature} />
                    <InfoRow label="Nice Classes" value={match.process.nice_classes} />
                  </div>
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Similarity Scores</p>
              <ScoreBar value={match.final_score} label="Final score" />
              {scores && (
                <div className="pt-2 border-t space-y-2">
                  {scores.name_score != null && <ScoreBar value={scores.name_score} label="Name" />}
                  {scores.services_score != null && <ScoreBar value={scores.services_score} label="Services" />}
                  {scores.image_score != null && <ScoreBar value={scores.image_score} label="Image" />}
                  {scores.similarity != null && <ScoreBar value={scores.similarity} label="Similarity" />}
                  {scores.rerank != null && <ScoreBar value={scores.rerank} label="Rerank" />}
                </div>
              )}
            </div>

            {/* Review actions */}
            <div className="rounded-lg border p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Review</p>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Notes</label>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="Add review notes…"
                  value={notes ?? match.notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {notes !== null && notes !== match.notes && (
                  <Button size="sm" variant="secondary" className="mt-2" onClick={handleSaveNotes} disabled={mutation.isPending}>
                    Save notes
                  </Button>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={mutation.isPending || (match.reviewed && match.confirmed)}
                  onClick={() => handleAction('confirm')}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm conflict
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={mutation.isPending || (match.reviewed && !match.confirmed)}
                  onClick={() => handleAction('dismiss')}
                  className="gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  Dismiss
                </Button>
                {!match.reviewed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ reviewed: true })}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <Eye className="h-4 w-4" />
                    Mark as reviewed
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
