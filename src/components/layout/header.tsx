'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navigation } from './navigation'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center relative">
        <div className="mr-4 flex md:mr-6">
          <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
            <div className="h-6 w-6 bg-primary rounded-sm" />
            <span className="hidden font-bold sm:inline-block">
              AI Design System Generator
            </span>
            <span className="font-bold sm:hidden">ADSG</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Navigation />
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
