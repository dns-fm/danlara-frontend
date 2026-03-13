import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronRight, ChevronLeft, FileText } from 'lucide-react'
import { DashboardLayout } from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/auth-context'
import { getTrademarksApi, type TrademarkListItem } from '../../../lib/api'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Skeleton } from '../../../components/ui/skeleton'
import { Label } from '../../../components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'

export const Route = createFileRoute('/third-party-brands/trademarks/')({
  component: TrademarksPage,
})

const PAGE_SIZE = 50

function TrademarksPage() {
  const { token } = useAuth()
  const [page, setPage] = useState(1)

  // Filter state (applied on search)
  const [search, setSearch] = useState('')
  const [reportNumber, setReportNumber] = useState('')
  const [depositFrom, setDepositFrom] = useState('')
  const [depositTo, setDepositTo] = useState('')

  // Committed filters (sent to API)
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedReportNumber, setAppliedReportNumber] = useState<number | undefined>()
  const [appliedDepositFrom, setAppliedDepositFrom] = useState('')
  const [appliedDepositTo, setAppliedDepositTo] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['trademarks', page, appliedSearch, appliedReportNumber, appliedDepositFrom, appliedDepositTo],
    queryFn: () =>
      getTrademarksApi(token!, {
        page,
        page_size: PAGE_SIZE,
        search: appliedSearch || undefined,
        report_number: appliedReportNumber,
        deposit_date_from: appliedDepositFrom || undefined,
        deposit_date_to: appliedDepositTo || undefined,
      }),
    enabled: !!token,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setAppliedSearch(search)
    setAppliedReportNumber(reportNumber ? Number(reportNumber) : undefined)
    setAppliedDepositFrom(depositFrom)
    setAppliedDepositTo(depositTo)
    setPage(1)
  }

  const handleReset = () => {
    setSearch('')
    setReportNumber('')
    setDepositFrom('')
    setDepositTo('')
    setAppliedSearch('')
    setAppliedReportNumber(undefined)
    setAppliedDepositFrom('')
    setAppliedDepositTo('')
    setPage(1)
  }

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  const hasActiveFilters = appliedSearch || appliedReportNumber || appliedDepositFrom || appliedDepositTo

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Trademarks</h1>
          <p className="text-muted-foreground mt-1">
            Search trademark filings across all RNPI publications.
          </p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="mb-6 rounded-lg border p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="search">Name</Label>
              <Input
                id="search"
                placeholder="Search by trademark name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-number">Publication No.</Label>
              <Input
                id="report-number"
                type="number"
                placeholder="e.g. 123"
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deposit-from">Deposit Date From</Label>
              <Input
                id="deposit-from"
                type="date"
                value={depositFrom}
                onChange={(e) => setDepositFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deposit-to">Deposit Date To</Label>
              <Input
                id="deposit-to"
                type="date"
                value={depositTo}
                onChange={(e) => setDepositTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              <Search className="h-4 w-4 mr-1.5" />
              Search
            </Button>
            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
                Clear filters
              </Button>
            )}
          </div>
        </form>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Nature</TableHead>
                <TableHead>Nice Classes</TableHead>
                <TableHead>Deposit Date</TableHead>
                <TableHead>Publication</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.items.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                        No trademarks found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  )
                  : data?.items.map((tm: TrademarkListItem) => (
                    <TableRow key={tm.id} className="cursor-pointer hover:bg-accent/50">
                      <TableCell className="font-mono text-sm">{tm.number}</TableCell>
                      <TableCell>
                        <Link
                          to="/third-party-brands/$reportId/$processId"
                          params={{ reportId: tm.report_id, processId: tm.id }}
                          className="font-medium hover:underline"
                        >
                          {tm.name ?? <span className="text-muted-foreground italic">Unnamed</span>}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tm.nature ?? '—'}</TableCell>
                      <TableCell className="text-sm">{tm.nice_classes || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(tm.deposit_date)}</TableCell>
                      <TableCell>
                        <Link
                          to="/third-party-brands/$reportId"
                          params={{ reportId: tm.report_id }}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                          #{tm.report_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {tm.is_active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" variant="outline">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/third-party-brands/$reportId/$processId"
                          params={{ reportId: tm.report_id, processId: tm.id }}
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {data.total.toLocaleString()} trademarks — page {data.page} of {data.total_pages}
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
