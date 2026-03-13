import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Upload } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth-context'
import { createBrandApi, ApiError } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'

export const Route = createFileRoute('/brands/new')({
  component: NewBrandPage,
})

function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function NewBrandPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const logoFileRef = useRef<HTMLInputElement>(null)
  const [logoMode, setLogoMode] = useState<'file' | 'url'>('file')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (formData: FormData) => createBrandApi(token!, formData),
    onSuccess: (brand) => {
      navigate({ to: '/brands/$brandId', params: { brandId: brand.id } })
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.detail : 'Something went wrong.')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)

    // Handle logo mode: if URL mode, remove the file field and ensure logo_url is set
    if (logoMode === 'url') {
      fd.delete('logo')
    } else {
      fd.delete('logo_url')
    }

    mutation.mutate(fd)
  }

  return (
    <DashboardLayout>
      <div className="px-8 py-8 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/brands" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            My Brands
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Add Brand</h1>
          <p className="text-muted-foreground mt-1">Register a single trademark manually.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Brand Name" hint="The trademark name">
                <Input name="name" placeholder="e.g. Acme Corp" />
              </FormField>
              <FormField label="External ID" hint="Internal reference / process number">
                <Input name="external_id" placeholder="e.g. 123456789" />
              </FormField>
              <FormField label="Nature">
                <Input name="nature" placeholder="e.g. Figurativa, Nominativa" />
              </FormField>
              <FormField label="Nice Class">
                <Input name="nice_class" placeholder="e.g. 25, 35" />
              </FormField>
              <FormField label="Status">
                <Input name="status" placeholder="e.g. Registered" />
              </FormField>
              <FormField label="Sector">
                <Input name="sector" placeholder="e.g. Fashion" />
              </FormField>
              <FormField label="Presentation">
                <Input name="presentation" placeholder="e.g. Colorida" />
              </FormField>
            </CardContent>
          </Card>

          {/* Client & Holder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Client & Holder</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Client">
                <Input name="client" placeholder="Client name" />
              </FormField>
              <FormField label="Titular">
                <Input name="titular" placeholder="Holder name" />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Client Note">
                  <Textarea name="client_note" placeholder="Optional notes…" rows={2} />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Dates</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <FormField label="Deposit Date">
                <Input name="deposit" type="date" />
              </FormField>
              <FormField label="Register Date">
                <Input name="register" type="date" />
              </FormField>
              <FormField label="First Register">
                <Input name="first_register" type="date" />
              </FormField>
              <FormField label="Extension">
                <Input name="extension" type="date" />
              </FormField>
            </CardContent>
          </Card>

          {/* Services & Additional */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Services & Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Services">
                <Textarea name="services" placeholder="Products and services description…" rows={3} />
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Reference">
                  <Input name="reference" placeholder="Internal reference" />
                </FormField>
                <FormField label="Priority">
                  <Input name="priority" placeholder="Priority claim" />
                </FormField>
                <FormField label="Unfolding">
                  <Input name="unfolding" placeholder="Desdobramento" />
                </FormField>
              </div>
              <FormField label="Publications">
                <Textarea name="publications" placeholder="One publication per line…" rows={2} />
              </FormField>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="_logoMode"
                    value="file"
                    checked={logoMode === 'file'}
                    onChange={() => setLogoMode('file')}
                    className="accent-primary"
                  />
                  <span className="text-sm">Upload file</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="_logoMode"
                    value="url"
                    checked={logoMode === 'url'}
                    onChange={() => setLogoMode('url')}
                    className="accent-primary"
                  />
                  <span className="text-sm">Enter URL</span>
                </label>
              </div>
              {logoMode === 'file' ? (
                <div>
                  <input
                    ref={logoFileRef}
                    type="file"
                    name="logo"
                    accept="image/*"
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
                  />
                </div>
              ) : (
                <Input name="logo_url" type="url" placeholder="https://example.com/logo.jpg" />
              )}
            </CardContent>
          </Card>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <input type="hidden" name="is_active" value="false" />
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              defaultChecked
              value="true"
              className="h-4 w-4 accent-primary"
            />
            <Label htmlFor="is_active">Mark as active</Label>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Brand'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate({ to: '/brands' })}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
