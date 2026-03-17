import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Tag, AlertTriangle, Globe, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/')({ component: LandingPage })

const features = [
  {
    title: 'Brand Portfolio',
    description: 'Upload and manage your entire brand portfolio in one place. Import from JSON or PDF with automatic embedding generation.',
    icon: Tag,
  },
  {
    title: 'Conflict Detection',
    description: 'AI-powered similarity analysis compares your brands against new INPI publications to surface potential trademark conflicts.',
    icon: AlertTriangle,
  },
  {
    title: 'INPI Monitoring',
    description: 'Daily automated monitoring of Brazilian trademark publications. Never miss a conflicting registration again.',
    icon: Globe,
  },
  {
    title: 'Review Workflow',
    description: 'Review, confirm, or dismiss detected conflicts with notes. Track your team\'s decisions across every publication.',
    icon: CheckCircle,
  },
]

function LandingPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 pb-20 pt-16">
      {/* Hero */}
      <section className="rounded-2xl border bg-card px-8 py-16 mb-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Trademark Intelligence
        </p>
        <h1 className="text-4xl font-bold tracking-tight mb-5 max-w-2xl sm:text-5xl">
          Protect your brands.<br className="hidden sm:block" /> Detect conflicts early.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mb-8">
          Danlara monitors INPI trademark publications daily, running AI-powered conflict analysis against your brand portfolio so you can act before it's too late.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/register">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {features.map(({ title, description, icon: Icon }) => (
          <Card key={title}>
            <CardContent className="pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* CTA */}
      <section className="rounded-2xl border bg-card px-8 py-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-3 sm:text-3xl">
          Ready to get started?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Choose a plan that fits your team and start monitoring trademark publications today.
        </p>
        <Button asChild size="lg">
          <Link to="/register">View plans & sign up</Link>
        </Button>
      </section>
    </main>
  )
}
