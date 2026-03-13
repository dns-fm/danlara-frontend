import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileJson, FileText, Upload, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/auth-context'
import { getUploadsApi, type UploadedFileItem } from '../../../lib/api'
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

export const Route = createFileRoute('/brands/uploads/')({
  component: UploadsPage,
})

function formatBytes(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StatusBadge({ status }: { status: UploadedFileItem['status'] }) {
  const map = {
    pending:    { label: 'Pending',    className: 'text-muted-foreground border-muted-foreground/30' },
    processing: { label: 'Processing', className: 'text-blue-600 border-blue-400/40 dark:text-blue-400' },
    done:       { label: 'Done',       className: 'text-green-700 border-green-500/40 dark:text-green-400' },
    failed:     { label: 'Failed',     className: 'text-destructive border-destructive/40' },
  }
  const { label, className } = map[status] ?? map.pending
  return <Badge variant="outline" className={cn('text-xs', className)}>{label}</Badge>
}

function UploadsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['brand-uploads'],
    queryFn: () => getUploadsApi(token!),
    enabled: !!token,
    refetchInterval: (query) => {
      // Keep polling while any upload is pending/processing
      const items = query.state.data
      if (items?.some((u) => u.status === 'pending' || u.status === 'processing')) return 4000
      return false
    },
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/brands" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            My Brands
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Uploaded Files</h1>
            <p className="text-muted-foreground mt-1">History of all JSON files submitted for bulk import.</p>
          </div>
          <Button size="sm" onClick={() => navigate({ to: '/brands/upload' })}>
            <Upload className="h-4 w-4 mr-1.5" />
            Upload new
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Brands</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
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
                        No files uploaded yet.
                      </TableCell>
                    </TableRow>
                  )
                  : data.map((upload: UploadedFileItem) => (
                    <>
                      <TableRow key={upload.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {upload.file_type === 'json'
                              ? <FileJson className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              : <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            }
                            <span className="font-mono text-sm">{upload.original_filename ?? '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={upload.status} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {upload.description || '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {upload.brand_count > 0
                            ? <span className="font-medium">{upload.brand_count.toLocaleString()}</span>
                            : <span className="text-muted-foreground">—</span>
                          }
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatBytes(upload.file_size)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(upload.uploaded_at)}
                        </TableCell>
                      </TableRow>
                      {upload.status === 'failed' && upload.error_message && (
                        <TableRow key={`${upload.id}-error`} className="bg-destructive/5 hover:bg-destructive/5">
                          <TableCell colSpan={6} className="py-2">
                            <div className="flex items-start gap-2 text-xs text-destructive">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                              <span className="font-mono break-all">{upload.error_message}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
              }
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
