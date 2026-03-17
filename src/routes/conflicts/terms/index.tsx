import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Trash2 } from 'lucide-react'
import { DashboardLayout } from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/auth-context'
import { getTermsApi, createTermApi, deleteTermApi, type GenericTerm, ApiError } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Skeleton } from '../../../components/ui/skeleton'
import { Badge } from '../../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'

export const Route = createFileRoute('/conflicts/terms/')({
  component: CommonWordsPage,
})

function CommonWordsPage() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [codeFilter, setCodeFilter] = useState('')

  // Add form state
  const [newCode, setNewCode] = useState('')
  const [newToken, setNewToken] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['generic-terms', search, codeFilter],
    queryFn: () => getTermsApi(token!, { search: search || undefined, code: codeFilter || undefined }),
    enabled: !!token,
  })

  const createMutation = useMutation({
    mutationFn: () => createTermApi(token!, { code: newCode.trim(), token: newToken.trim().toLowerCase() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generic-terms'] })
      setNewCode('')
      setNewToken('')
      setAddError(null)
    },
    onError: (err) => setAddError(err instanceof ApiError ? err.detail : 'Failed to add term.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (termId: number) => deleteTermApi(token!, termId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['generic-terms'] }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode.trim() || !newToken.trim()) return
    createMutation.mutate()
  }

  // Group terms by nice class code for a cleaner display
  const grouped = data?.reduce<Record<string, GenericTerm[]>>((acc, t) => {
    if (!acc[t.code]) acc[t.code] = []
    acc[t.code].push(t)
    return acc
  }, {})

  const uniqueCodes = grouped ? Object.keys(grouped).sort() : []

  return (
    <DashboardLayout>
      <div className="px-8 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Common Words</h1>
          <p className="text-muted-foreground mt-1">
            Words filtered from brand names during conflict analysis. Useful for removing generic terms (e.g. "LTDA", "BRASIL") that would inflate similarity scores.
          </p>
        </div>

        {/* Add new term */}
        <div className="rounded-lg border p-4 mb-6">
          <p className="text-sm font-medium mb-3">Add word</p>
          <form onSubmit={handleAdd} className="flex gap-3 flex-wrap items-end">
            <div className="space-y-1">
              <Label htmlFor="new-code" className="text-xs text-muted-foreground">Nice class code</Label>
              <Input
                id="new-code"
                placeholder="e.g. 35"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="space-y-1 flex-1 min-w-40">
              <Label htmlFor="new-token" className="text-xs text-muted-foreground">Word</Label>
              <Input
                id="new-token"
                placeholder="e.g. brasil"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={createMutation.isPending || !newCode.trim() || !newToken.trim()}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
          </form>
          {addError && <p className="text-sm text-destructive mt-2">{addError}</p>}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48 max-w-sm">
            <Input
              placeholder="Search words or class codes…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          {uniqueCodes.length > 0 && (
            <div className="flex gap-1.5 flex-wrap items-center">
              <button
                type="button"
                onClick={() => setCodeFilter('')}
                className={`text-xs px-2 py-1 rounded-md border transition-colors ${!codeFilter ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
              >
                All
              </button>
              {uniqueCodes.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCodeFilter(codeFilter === c ? '' : c)}
                  className={`text-xs px-2 py-1 rounded-md border transition-colors ${codeFilter === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Nice class</TableHead>
                <TableHead>Word</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 3 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : !data?.length
                  ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        No common words defined yet.
                      </TableCell>
                    </TableRow>
                  )
                  : data.map((term: GenericTerm) => (
                    <TableRow key={term.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">{term.code}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{term.token}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(term.id)}
                          disabled={deleteMutation.isPending}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </div>

        {data && (
          <p className="text-xs text-muted-foreground mt-3">
            {data.length.toLocaleString()} {data.length === 1 ? 'word' : 'words'} total
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
