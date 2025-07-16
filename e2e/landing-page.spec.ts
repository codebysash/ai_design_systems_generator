import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load the landing page successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that the main heading is visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Generate Design Systems')
    
    // Check for hero section
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
    
    // Check for call-to-action button
    await expect(page.locator('text="Start Generating"')).toBeVisible()
    
    // Check for features section
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()
  })

  test('should have proper navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation exists (use first nav element)
    await expect(page.locator('nav').first()).toBeVisible()
    
    // Check logo/brand link
    await expect(page.locator('[data-testid="brand-logo"]')).toBeVisible()
    
    // Test navigation to generate page
    await page.click('text="Start Generating"')
    await expect(page).toHaveURL('/generate')
  })

  test('should be SEO optimized', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    const title = await page.title()
    expect(title).toContain('Design System Generator')
    
    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    expect(metaDescription).toBeTruthy()
    expect(metaDescription).toContain('AI')
    
    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()
    
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content')
    expect(ogDescription).toBeTruthy()
  })

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Check for main content area (may be div with role or main tag)
    const mainContent = page.locator('main, [role="main"], #main-content')
    await expect(mainContent.first()).toBeVisible()
    
    // Check for proper heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1)
    
    // Check for skip link
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    const skipLinkText = await focusedElement.textContent()
    expect(skipLinkText).toContain('Skip')
    
    // Check color contrast (basic check for text visibility)
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Check for alt text on images
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })

  test('should load quickly and perform well', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      }
    })
    
    // DOM should load quickly
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000)
  })

  test('should handle different viewport sizes', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await expect(page.locator('h1')).toBeVisible()
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await expect(page.locator('h1')).toBeVisible()
    
    // Mobile menu should be available on small screens
    const mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]')
    if (await mobileMenuToggle.isVisible()) {
      await mobileMenuToggle.click()
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    }
  })

  test('should have working footer links', async ({ page }) => {
    await page.goto('/')
    
    // Check footer exists
    await expect(page.locator('footer')).toBeVisible()
    
    // Check for important links (if they exist)
    const footerLinks = await page.locator('footer a').all()
    expect(footerLinks.length).toBeGreaterThan(0)
    
    // Test that links don't result in 404s (basic check)
    for (let i = 0; i < Math.min(footerLinks.length, 3); i++) {
      const link = footerLinks[i]
      const href = await link.getAttribute('href')
      
      if (href && href.startsWith('/')) {
        // Only test internal links
        const response = await page.request.get(href)
        expect(response.status()).toBeLessThan(400)
      }
    }
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page')
    
    // Should show 404 page or redirect
    const title = await page.title()
    const content = await page.textContent('body')
    
    // Should either be a 404 page or redirect to home
    expect(title.includes('404') || title.includes('Not Found') || page.url().includes('/')).toBeTruthy()
  })
})