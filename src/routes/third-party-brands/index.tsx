import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FileText, ChevronRight, ChevronLeft } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth-context'
import { getReportsApi, type Report } from '../../lib/api'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

export const Route = createFileRoute('/third-party-brands/')({
  component: ThirdPartyBrandsPage,
})

const PAGE_SIZE = 20

function ThirdPartyBrandsPage() {
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reports', page, search],
    queryFn: () => getReportsApi(token!, { page, page_size: PAGE_SIZE, search: search || undefined }),
    enabled: !!token,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  const statusColor: Record<string, string> = {
    C: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    P: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  const statusLabel: Record<string, string> = { C: 'Completed', P: 'Pending' }

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Third-Party Brands</h1>
          <p className="text-muted-foreground mt-1">Browse official trademark publications (RNPI reports).</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-md">
          <Input
            placeholder="Search publications…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Publication Date</TableHead>
                <TableHead className="text-right">Processes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.items.map((report: Report) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer hover:bg-accent/50"
                    >
                      <TableCell className="font-mono text-sm">{report.number}</TableCell>
                      <TableCell>
                        <Link
                          to="/third-party-brands/$reportId"
                          params={{ reportId: report.id }}
                          className="flex items-center gap-2 font-medium hover:underline"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {report.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(report.publication_date)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {report.number_of_processes ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor[report.status] ?? ''} variant="outline">
                          {statusLabel[report.status] ?? report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/third-party-brands/$reportId"
                          params={{ reportId: report.id }}
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
              {data.total} publications — page {data.page} of {data.total_pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
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
