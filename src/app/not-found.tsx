import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout'

export default function NotFound() {
  return (
    <Main className="flex flex-col items-center justify-center py-24">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <svg
            className="h-16 w-16 text-muted-foreground mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 0a6 6 0 016-6m-6 6a6 6 0 01-6-6m6 6v6a6 6 0 006-6m-6 6a6 6 0 01-6-6m6 6v6a6 6 0 006-6"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild>
            <Link href="/">Explore Features</Link>
          </Button>
        </div>
      </div>
    </Main>
  )
}
