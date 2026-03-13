import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth-context'
import { uploadBrandsJsonApi, ApiError } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export const Route = createFileRoute('/brands/upload')({
  component: UploadBrandsPage,
})

const JSON_EXAMPLE = `[
  {
    "id": "ABCDEF123456",
    "marca": "Brand Name",
    "natureza": "Figurativa",
    "classe": "25",
    "status": "Registered",
    "setor": "Fashion",
    "apresentacao": "Colorida",
    "cliente": "Client Name",
    "titular": "Holder Name",
    "servicos": "Products and services description",
    "publicacoes": ["RPI 2750"],
    "referencia": "REF-001",
    "prioridade": null,
    "desdobramento": null,
    "prorrogacao": "01/01/2030",
    "data_deposito": "15/03/2020",
    "data_registro": "10/06/2021",
    "data_primeiro_registro": "10/06/2021",
    "logo": "https://example.com/logo.jpg"
  }
]`

function UploadBrandsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [showFormat, setShowFormat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData: FormData) => uploadBrandsJsonApi(token!, formData),
    onSuccess: () => setSuccess(true),
    onError: (err) => {
      setError(err instanceof ApiError ? err.detail : 'Upload failed.')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fileInput = form.elements.namedItem('file') as HTMLInputElement
    if (!fileInput.files?.length) {
      setError('Please select a JSON file.')
      return
    }
    const fd = new FormData(form)
    mutation.mutate(fd)
  }

  return (
    <DashboardLayout>
      <div className="px-8 py-8 max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/brands" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            My Brands
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Upload Brands</h1>
          <p className="text-muted-foreground mt-1">
            Import multiple brands at once from a JSON file. Logos can be URLs or base64 strings.
          </p>
        </div>

        {success ? (
          <Card>
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div>
                <h2 className="text-lg font-semibold">File received</h2>
                <p className="text-muted-foreground mt-1">
                  Your brands are being created in the background. This may take a few minutes.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={() => setSuccess(false)}>Upload another</Button>
                <Button onClick={() => navigate({ to: '/brands' })}>View Brands</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">JSON File</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="file">Select file</Label>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    accept=".json,application/json"
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="e.g. Client ABC — March 2024 batch"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Expected format */}
            <Card>
              <CardHeader className="pb-0">
                <button
                  type="button"
                  className="flex items-center justify-between w-full text-sm font-medium text-left"
                  onClick={() => setShowFormat((v) => !v)}
                >
                  Expected JSON format
                  {showFormat ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
              </CardHeader>
              {showFormat && (
                <CardContent className="pt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Array of objects. The <code className="bg-muted px-1 rounded">logo</code> field accepts a URL (<code className="bg-muted px-1 rounded">https://…</code>) or a base64 data URI (<code className="bg-muted px-1 rounded">data:image/jpeg;base64,…</code>). Dates must be in <strong>DD/MM/YYYY</strong> format.
                  </p>
                  <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto text-muted-foreground">
                    {JSON_EXAMPLE}
                  </pre>
                </CardContent>
              )}
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Uploading…' : 'Upload'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate({ to: '/brands' })}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
