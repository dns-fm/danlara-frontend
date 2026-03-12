import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { useAuth } from '#/lib/auth-context'

export default function AuthHeader() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return <div className="h-8 w-20 animate-pulse rounded-md bg-[var(--line)]" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs font-medium text-[var(--sea-ink-soft)] sm:block">
          {user.email}
        </span>
        <button
          onClick={() => void logout()}
          className="h-9 rounded-lg border border-[var(--line)] bg-white/50 px-3 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-white/80"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link to="/login">Sign in</Link>
    </Button>
  )
}
