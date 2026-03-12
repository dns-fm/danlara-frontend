import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ArrowLeft, Tag, Calendar, FileText, Building2, Globe } from 'lucide-react'
import { DashboardLayout } from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/auth-context'
import { getProcessApi } from '../../../lib/api'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'
import { Separator } from '../../../components/ui/separator'

export const Route = createFileRoute('/third-party-brands/$reportId/$processId')({
  component: ProcessDetailPage,
})

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  )
}

function ProcessDetailPage() {
  const { reportId, processId } = Route.useParams()
  const { token } = useAuth()

  const { data: process, isLoading } = useQuery({
    queryKey: ['process', processId],
    queryFn: () => getProcessApi(token!, processId),
    enabled: !!token,
  })

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null

  return (
    <DashboardLayout>
      <div className="px-8 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/third-party-brands" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Publications
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            to="/third-party-brands/$reportId"
            params={{ reportId }}
            className="hover:text-foreground"
          >
            {isLoading ? '…' : `Report ${process?.report_number}`}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">
            {isLoading ? '…' : (process?.number ?? processId)}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        ) : process ? (
          <>
            {/* Title */}
            <div className="mb-6">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight flex-1">
                  {process.name ?? <span className="text-muted-foreground italic">Unnamed Process</span>}
                </h1>
                {process.is_active ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" variant="outline">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                Process {process.number} · {process.report_name}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Core details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Process Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <Field label="Number" value={process.number} />
                    <Field label="Nature" value={process.nature} />
                    <Field label="Presentation" value={process.presentation} />
                    <Field label="Deposit Date" value={formatDate(process.deposit_date)} />
                    <Field label="Grant Date" value={formatDate(process.grant_date)} />
                    <Field label="Validity Date" value={formatDate(process.validity_date)} />
                  </dl>
                </CardContent>
              </Card>

              {/* Publication */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Publication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <Field label="Report" value={`${process.report_name} (#${process.report_number})`} />
                    <Field
                      label="Created"
                      value={formatDate(process.created_at)}
                    />
                    <Field
                      label="Last Updated"
                      value={formatDate(process.updated_at)}
                    />
                  </dl>
                </CardContent>
              </Card>

              {/* NICE Classes */}
              {process.nice && process.nice.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Tag className="h-4 w-4" /> NICE Classifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(process.nice as Array<{ code?: number; service?: string }>).map((entry, i) => (
                        <div key={i}>
                          {i > 0 && <Separator className="mb-3" />}
                          <div className="flex gap-2 flex-wrap items-start">
                            {entry.code && (
                              <Badge variant="secondary" className="flex-shrink-0">
                                Class {entry.code}
                              </Badge>
                            )}
                            {entry.service && (
                              <span className="text-sm text-muted-foreground">{entry.service}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Titular */}
              {process.titular && (process.titular as unknown[]).length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Titular
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(process.titular as Array<Record<string, string>>).map((t, i) => (
                        <li key={i} className="text-sm">
                          {Object.values(t).filter(Boolean).join(' · ')}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Madrid */}
              {process.madrid && (process.madrid as unknown[]).length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Madrid Protocol
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs text-muted-foreground overflow-auto">
                      {JSON.stringify(process.madrid, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Logo */}
              {process.logo_url && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Brand Logo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={process.logo_url}
                      alt={process.name ?? 'Brand logo'}
                      className="max-h-32 object-contain"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {process.metadata && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{process.metadata}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Process not found.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
