import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronRight, ChevronLeft, Plus, Upload, Tag } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth-context'
import { getBrandsApi, type BrandListItem } from '../../lib/api'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

export const Route = createFileRoute('/brands/')({
  component: BrandsPage,
})

const PAGE_SIZE = 20

function BrandsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const isActive = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined

  const { data, isLoading } = useQuery({
    queryKey: ['brands', page, search, activeFilter],
    queryFn: () => getBrandsApi(token!, { page, page_size: PAGE_SIZE, search: search || undefined, is_active: isActive }),
    enabled: !!token,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Brands</h1>
            <p className="text-muted-foreground mt-1">Manage your trademark portfolio.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/brands/upload' })}>
              <Upload className="h-4 w-4 mr-1.5" />
              Upload JSON
            </Button>
            <Button size="sm" onClick={() => navigate({ to: '/brands/new' })}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Brand
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48 max-w-md">
            <Input
              placeholder="Search by name…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v as typeof activeFilter); setPage(1) }}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Name</TableHead>
                <TableHead>External ID</TableHead>
                <TableHead>Nice Class</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Deposit Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.items.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                        No brands found.
                      </TableCell>
                    </TableRow>
                  )
                  : data?.items.map((brand: BrandListItem) => (
                    <TableRow
                      key={brand.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => navigate({ to: '/brands/$brandId', params: { brandId: brand.id } })}
                    >
                      <TableCell>
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name ?? ''}
                            className="h-10 w-10 object-contain rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {brand.name ?? <span className="text-muted-foreground italic">Unnamed</span>}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {brand.external_id ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm">{brand.nice_class || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{brand.client ?? '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(brand.deposit)}</TableCell>
                      <TableCell>
                        {brand.is_active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" variant="outline">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link to="/brands/$brandId" params={{ brandId: brand.id }} onClick={(e) => e.stopPropagation()}>
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
              {data.total.toLocaleString()} brands — page {data.page} of {data.total_pages}
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
