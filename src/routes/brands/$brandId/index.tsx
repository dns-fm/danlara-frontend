import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Tag, Calendar, User, FileText, Briefcase } from 'lucide-react'
import { DashboardLayout } from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/auth-context'
import { getBrandApi } from '../../../lib/api'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'
import { Separator } from '../../../components/ui/separator'

export const Route = createFileRoute('/brands/$brandId/')({
  component: BrandDetailPage,
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

function BrandDetailPage() {
  const { brandId } = Route.useParams()
  const { token } = useAuth()

  const { data: brand, isLoading } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => getBrandApi(token!, brandId),
    enabled: !!token,
  })

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null

  return (
    <DashboardLayout>
      <div className="px-8 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/brands" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            My Brands
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          </div>
        ) : brand ? (
          <>
            {/* Title */}
            <div className="mb-6">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight flex-1">
                  {brand.name ?? <span className="text-muted-foreground italic">Unnamed Brand</span>}
                </h1>
                {brand.is_active ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" variant="outline">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                )}
              </div>
              {brand.external_id && (
                <p className="text-muted-foreground mt-1 font-mono text-sm">ID: {brand.external_id}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Identity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Identity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <Field label="Name" value={brand.name} />
                    <Field label="External ID" value={brand.external_id} />
                    <Field label="Nature" value={brand.nature} />
                    <Field label="Nice Class" value={brand.nice_class} />
                    <Field label="Status" value={brand.status} />
                    <Field label="Sector" value={brand.sector} />
                    <Field label="Presentation" value={brand.presentation} />
                  </dl>
                </CardContent>
              </Card>

              {/* Dates */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <Field label="Deposit Date" value={formatDate(brand.deposit)} />
                    <Field label="Register Date" value={formatDate(brand.register)} />
                    <Field label="First Register" value={formatDate(brand.first_register)} />
                    <Field label="Extension" value={formatDate(brand.extension)} />
                  </dl>
                </CardContent>
              </Card>

              {/* Client & Holder */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" /> Client & Holder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <Field label="Client" value={brand.client} />
                    <Field label="Titular" value={brand.titular} />
                    {brand.client_note && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Note</dt>
                        <dd className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{brand.client_note}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              {/* Logo */}
              {brand.logo_url && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Logo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={brand.logo_url}
                      alt={brand.name ?? 'Brand logo'}
                      className="max-h-40 object-contain"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Services */}
              {brand.services && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{brand.services}</p>
                  </CardContent>
                </Card>
              )}

              {/* Publications / Reference / Priority / Unfolding */}
              {(brand.publications || brand.reference || brand.priority || brand.unfolding) && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Additional Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-3">
                      <Field label="Reference" value={brand.reference} />
                      <Field label="Priority" value={brand.priority} />
                      <Field label="Unfolding" value={brand.unfolding} />
                      {brand.publications && (
                        <div>
                          <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Publications</dt>
                          <dd className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{brand.publications}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <div className="md:col-span-2">
                <Separator className="mb-3" />
                <p className="text-xs text-muted-foreground">
                  Created {new Date(brand.created_at).toLocaleDateString()} · Updated {new Date(brand.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Brand not found.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
