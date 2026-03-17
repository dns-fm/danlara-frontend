import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { useAuth } from '#/lib/auth-context'

export default function AuthHeader() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:block">{user.email}</span>
        <Button variant="outline" size="sm" onClick={() => void logout()}>
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link to="/login">Sign in</Link>
    </Button>
  )
}
