import { Link } from '@tanstack/react-router'
import AuthHeader from './AuthHeader'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="max-w-5xl mx-auto px-6 flex items-center gap-4 h-14">
        <Link to="/" className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity">
          Danlara
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <AuthHeader />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
