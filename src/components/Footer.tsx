export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t mt-16 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>&copy; {year} Danlara. All rights reserved.</p>
        <p>Trademark intelligence for IP professionals.</p>
      </div>
    </footer>
  )
}
