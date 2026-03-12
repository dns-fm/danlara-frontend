import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export const Route = createFileRoute('/register/complete')({
  component: RegisterCompletePage,
})

function RegisterCompletePage() {
  return (
    <main className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(79,184,178,0.14)] text-2xl">
            ✉️
          </div>
          <CardTitle className="text-2xl">Check your inbox</CardTitle>
          <CardDescription>
            Your account has been created and your subscription is being
            activated.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            We&apos;ve sent a verification email to your address. Please click
            the link in the email to verify your account before logging in.
          </p>

          <div className="rounded-xl border border-[var(--line)] bg-[rgba(79,184,178,0.06)] px-4 py-3 text-sm text-[var(--sea-ink-soft)]">
            Didn&apos;t receive the email? Check your spam folder, or contact
            support.
          </div>

          <Button asChild className="w-full">
            <Link to="/login">Go to Sign In</Link>
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link to="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
