'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigationItems = [
  { name: 'Features', href: '/#features' },
  { name: 'Examples', href: '/#examples' },
  { name: 'Documentation', href: '/#docs' },
  { name: 'Pricing', href: '/#pricing' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        id="navigation"
        className="hidden md:flex items-center gap-6 text-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        {navigationItems.map(item => (
          <Link
            key={item.href}
            href={item.href as any}
            className={cn(
              'transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-2 py-1',
              pathname === item.href
                ? 'text-gray-900 font-medium'
                : 'text-gray-600'
            )}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation Toggle */}
      <Button
        variant="ghost"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
      >
        <svg
          className={cn('h-5 w-5 transition-transform', isOpen && 'rotate-90')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </Button>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-14 z-50 bg-background border-b md:hidden"
          role="dialog"
          aria-label="Mobile navigation menu"
        >
          <nav
            className="container py-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col space-y-3">
              {navigationItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={cn(
                    'text-sm transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-2 py-1',
                    pathname === item.href
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600'
                  )}
                  onClick={() => setIsOpen(false)}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="ghost" size="sm" className="justify-start">
                  Sign In
                </Button>
                <Button size="sm" className="justify-start">
                  Get Started
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
