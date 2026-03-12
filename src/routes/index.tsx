import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({ component: LandingPage })

const features = [
  {
    title: 'Brand Management',
    description:
      'Centralise your brand assets, guidelines, and collateral in one powerful workspace.',
    icon: '🏷️',
  },
  {
    title: 'Job Matching',
    description:
      'AI-driven matching connects the right candidates to the right opportunities instantly.',
    icon: '🎯',
  },
  {
    title: 'Smart Analytics',
    description:
      'Deep insights powered by embeddings and semantic search across all your data.',
    icon: '📊',
  },
  {
    title: 'Flexible Plans',
    description:
      'Scale from startup to enterprise with plans that grow alongside your business.',
    icon: '🚀',
  },
]

function LandingPage() {
  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      {/* Hero */}
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-14 sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

        <p className="island-kicker mb-4 text-sm font-semibold uppercase tracking-widest">
          Welcome to Danlara
        </p>
        <h1 className="display-title mb-6 max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Build smarter.<br className="hidden sm:block" /> Connect faster.
        </h1>
        <p className="mb-10 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Danlara is the all-in-one platform for brand management, intelligent
          job matching, and subscription-powered growth. Everything your team
          needs, in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ title, description, icon }, index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <div className="mb-3 text-2xl">{icon}</div>
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
              {description}
            </p>
          </article>
        ))}
      </section>

      {/* Pricing CTA */}
      <section className="island-shell rise-in mt-10 rounded-2xl px-6 py-10 text-center sm:px-12">
        <p className="island-kicker mb-3 text-sm font-semibold uppercase tracking-widest">
          Pricing
        </p>
        <h2 className="mb-4 text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
          Choose the right plan for your team
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-base text-[var(--sea-ink-soft)]">
          From growing startups to established enterprises — every plan unlocks
          the full Danlara platform with flexible billing.
        </p>
        <Button asChild size="lg">
          <Link to="/register">View Plans & Sign Up</Link>
        </Button>
      </section>
    </main>
  )
}
