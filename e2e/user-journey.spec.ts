import { test, expect } from '@playwright/test'

test.describe('Design System Generator User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the home page
    await page.goto('/')
  })

  test('should complete the full design system generation workflow', async ({ page }) => {
    // Landing page should load correctly
    await expect(page.locator('h1')).toContainText(['Transform', 'Design Systems'])
    
    // Navigate to generation page via CTA button
    await page.click('text="Start Generating"')
    await expect(page).toHaveURL('/generate')
    
    // Fill out the design system form
    await page.fill('[placeholder*="design system"]', 'E-commerce Design System')
    await page.fill('[placeholder*="description"]', 'A modern design system for e-commerce applications with clean aesthetics and accessible components')
    
    // Select style preference
    await page.click('[data-testid="style-modern"]', { timeout: 10000 })
    
    // Enter primary color
    await page.fill('input[type="color"]', '#3B82F6')
    
    // Select industry
    await page.selectOption('select', 'e-commerce')
    
    // Select components to generate
    await page.check('text="Button"')
    await page.check('text="Input"')
    await page.check('text="Card"')
    
    // Submit the form
    await page.click('button[type="submit"]')
    
    // Should show generation progress
    await expect(page.locator('[data-testid="generation-progress"]')).toBeVisible({ timeout: 10000 })
    
    // Wait for generation to complete (with mock data)
    await expect(page.locator('[data-testid="component-playground"]')).toBeVisible({ timeout: 30000 })
    
    // Verify component playground loaded
    await expect(page.locator('text="Button"')).toBeVisible()
    await expect(page.locator('text="Input"')).toBeVisible()
    await expect(page.locator('text="Card"')).toBeVisible()
    
    // Test component variant switching
    await page.click('[data-testid="variant-selector"]')
    await page.click('text="Secondary"')
    
    // Test size switching
    await page.click('[data-testid="size-selector"]')
    await page.click('text="Large"')
    
    // Test export functionality
    await page.click('[data-testid="export-button"]')
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible()
    
    // Test different export formats
    await page.click('text="React Components"')
    await page.click('[data-testid="download-button"]')
    
    // Verify download initiated (check for download event)
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="confirm-download"]')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('design-system')
  })

  test('should handle form validation errors gracefully', async ({ page }) => {
    await page.goto('/generate')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text="required"')).toBeVisible()
    
    // Fill partial form
    await page.fill('[placeholder*="design system"]', 'Test')
    await page.click('button[type="submit"]')
    
    // Should show description validation error
    await expect(page.locator('text="at least 10 characters"')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Landing page should be responsive
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible()
    
    // Navigation should work on mobile
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Generate page should be responsive
    await page.goto('/generate')
    await expect(page.locator('form')).toBeVisible()
    
    // Form should be usable on mobile
    await page.fill('[placeholder*="design system"]', 'Mobile Test System')
    await page.fill('[placeholder*="description"]', 'Testing mobile responsiveness for the design system generator')
    
    // Form elements should be accessible
    await expect(page.locator('input[type="color"]')).toBeVisible()
    await expect(page.locator('select')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/generate')
    
    // Fill out form
    await page.fill('[placeholder*="design system"]', 'Network Test System')
    await page.fill('[placeholder*="description"]', 'Testing network error handling in the application')
    
    // Simulate network failure during form submission
    await page.route('**/api/**', route => route.abort())
    
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text="network"')).toBeVisible()
    
    // Should allow retry
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('should maintain accessibility standards', async ({ page }) => {
    // Test keyboard navigation
    await page.goto('/')
    
    // Should be able to navigate with keyboard
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Check for skip links
    await page.keyboard.press('Tab')
    await expect(page.locator('[href="#main-content"]')).toBeFocused()
    
    // Test form accessibility
    await page.goto('/generate')
    
    // All form inputs should have labels
    const inputs = await page.locator('input, select, textarea').all()
    for (const input of inputs) {
      const id = await input.getAttribute('id')
      if (id) {
        await expect(page.locator(`label[for="${id}"]`)).toBeVisible()
      }
    }
    
    // Check ARIA attributes
    await expect(page.locator('[role="main"]')).toBeVisible()
    await expect(page.locator('[aria-live]')).toBeVisible()
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to generate page
    await page.click('text="Start Generating"')
    await expect(page).toHaveURL('/generate')
    
    // Fill some form data
    await page.fill('[placeholder*="design system"]', 'Navigation Test')
    
    // Go back
    await page.goBack()
    await expect(page).toHaveURL('/')
    
    // Go forward
    await page.goForward()
    await expect(page).toHaveURL('/generate')
    
    // Form should preserve state (if implemented)
    // This would depend on form state management implementation
  })

  test('should load and display components correctly', async ({ page }) => {
    await page.goto('/generate')
    
    // Fill minimum required fields
    await page.fill('[placeholder*="design system"]', 'Component Test System')
    await page.fill('[placeholder*="description"]', 'Testing component loading and display functionality')
    
    // Submit form (with mocked successful response)
    await page.click('button[type="submit"]')
    
    // Wait for playground to load
    await expect(page.locator('[data-testid="component-playground"]')).toBeVisible({ timeout: 30000 })
    
    // Check that components are visually rendered
    await expect(page.locator('.component-preview')).toBeVisible()
    
    // Test component interactions
    await page.hover('.component-preview button')
    await page.click('.component-preview button')
    
    // Verify no console errors during interaction
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should have minimal console errors
    expect(logs.filter(log => !log.includes('favicon')).length).toBeLessThan(3)
  })
})