import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
  Link,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { DashboardLayout } from '../components/DashboardLayout'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { AuthProvider } from '../lib/auth-context'

interface MyRouterContext {
  queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

function NotFound() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4 text-center">
        <p className="text-7xl font-bold text-muted-foreground/30">404</p>
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="text-sm underline underline-offset-4 text-primary mt-2">
          Go to dashboard
        </Link>
      </div>
    </DashboardLayout>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

const APP_ROUTES = ['/dashboard', '/third-party-brands', '/brands', '/billing', '/conflicts', '/account']

function AppShell({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState()
  const isApp = APP_ROUTES.some((p) => location.pathname.startsWith(p))
  if (isApp) return <>{children}</>
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <TanStackQueryProvider>
          <AuthProvider>
          <AppShell>{children}</AppShell>
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
          </AuthProvider>
        </TanStackQueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
