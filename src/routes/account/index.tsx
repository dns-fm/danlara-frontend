import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Camera } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth-context'
import { updateProfileApi, updateAvatarApi, changePasswordApi, ApiError } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Separator } from '../../components/ui/separator'

export const Route = createFileRoute('/account/')({
  component: AccountPage,
})

function AccountPage() {
  const { user, token, refreshUser } = useAuth()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const initials = user ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() : ''

  // ── Profile form ────────────────────────────────────────────────────────────
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const profileMutation = useMutation({
    mutationFn: (data: { first_name: string; last_name: string }) =>
      updateProfileApi(token!, data),
    onSuccess: () => {
      setProfileSuccess(true)
      setProfileError(null)
      refreshUser?.()
    },
    onError: (err) => setProfileError(err instanceof ApiError ? err.detail : 'Update failed.'),
  })

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileSuccess(false)
    const fd = new FormData(e.currentTarget)
    profileMutation.mutate({
      first_name: fd.get('first_name') as string,
      last_name: fd.get('last_name') as string,
    })
  }

  // ── Avatar ──────────────────────────────────────────────────────────────────
  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('avatar', file)
      return updateAvatarApi(token!, fd)
    },
    onSuccess: () => refreshUser?.(),
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) avatarMutation.mutate(file)
  }

  // ── Password form ───────────────────────────────────────────────────────────
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const passwordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password1: string; new_password2: string }) =>
      changePasswordApi(token!, data),
    onSuccess: () => {
      setPasswordSuccess(true)
      setPasswordError(null)
    },
    onError: (err) => setPasswordError(err instanceof ApiError ? err.detail : 'Password change failed.'),
  })

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordSuccess(false)
    const form = e.currentTarget
    const fd = new FormData(form)
    const new1 = fd.get('new_password1') as string
    const new2 = fd.get('new_password2') as string
    if (new1 !== new2) {
      setPasswordError('New passwords do not match.')
      return
    }
    passwordMutation.mutate({
      current_password: fd.get('current_password') as string,
      new_password1: new1,
      new_password2: new2,
    })
    form.reset()
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="px-8 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Account</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and security settings.</p>
        </div>

        {/* Avatar + name header */}
        <Card className="mb-6">
          <CardContent className="pt-6 flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar ?? undefined} alt={user.first_name} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarMutation.isPending}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="font-semibold">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.is_email_verified
                ? <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
                : <span className="text-xs text-yellow-600 dark:text-yellow-400">Email not verified</span>
              }
            </div>
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Personal Information</CardTitle>
            <CardDescription>Update your name.</CardDescription>
          </CardHeader>
          <CardContent>
            {profileError && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                Profile updated.
              </div>
            )}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name">First name</Label>
                  <Input id="first_name" name="first_name" defaultValue={user.first_name} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input id="last_name" name="last_name" defaultValue={user.last_name} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={user.email} disabled />
              </div>
              <Button type="submit" size="sm" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Password form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Change Password</CardTitle>
            <CardDescription>Choose a strong password you don't use elsewhere.</CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                Password changed successfully.
              </div>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current_password">Current password</Label>
                <Input id="current_password" name="current_password" type="password" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_password1">New password</Label>
                <Input id="new_password1" name="new_password1" type="password" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new_password2">Confirm new password</Label>
                <Input id="new_password2" name="new_password2" type="password" required />
              </div>
              <Button type="submit" size="sm" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
