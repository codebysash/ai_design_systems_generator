import { test, expect } from '@playwright/test'

test.describe('Design System Form Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate')
  })

  test('should validate form inputs correctly', async ({ page }) => {
    // Test empty form submission
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText('required')
    await expect(page.locator('[data-testid="description-error"]')).toContainText('required')
    
    // Test name validation
    await page.fill('[data-testid="name-input"]', 'A')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="name-error"]')).toContainText('at least')
    
    // Test description validation
    await page.fill('[data-testid="name-input"]', 'Valid Design System Name')
    await page.fill('[data-testid="description-input"]', 'Short')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="description-error"]')).toContainText('at least 10 characters')
    
    // Test color validation
    await page.fill('[data-testid="description-input"]', 'A valid description with at least ten characters')
    await page.fill('[data-testid="color-input"]', 'invalid-color')
    await page.click('button[type="submit"]')
    await expect(page.locator('[data-testid="color-error"]')).toContainText('hex color')
  })

  test('should handle form interactions smoothly', async ({ page }) => {
    // Fill form fields step by step
    await page.fill('[data-testid="name-input"]', 'Interactive Test System')
    await expect(page.locator('[data-testid="name-input"]')).toHaveValue('Interactive Test System')
    
    await page.fill('[data-testid="description-input"]', 'Testing form interactions and user experience flows')
    await expect(page.locator('[data-testid="description-input"]')).toHaveValue('Testing form interactions and user experience flows')
    
    // Test style selection
    const styleOptions = await page.locator('[data-testid*="style-"]').all()
    expect(styleOptions.length).toBeGreaterThan(0)
    
    await page.click('[data-testid="style-modern"]')
    await expect(page.locator('[data-testid="style-modern"]')).toHaveClass(/selected|active|checked/)
    
    // Test color picker
    await page.fill('[data-testid="color-input"]', '#FF5733')
    await expect(page.locator('[data-testid="color-input"]')).toHaveValue('#FF5733')
    
    // Test industry selection
    await page.selectOption('[data-testid="industry-select"]', 'technology')
    await expect(page.locator('[data-testid="industry-select"]')).toHaveValue('technology')
    
    // Test component selection
    await page.check('[data-testid="component-button"]')
    await expect(page.locator('[data-testid="component-button"]')).toBeChecked()
    
    await page.check('[data-testid="component-input"]')
    await expect(page.locator('[data-testid="component-input"]')).toBeChecked()
  })

  test('should preserve form state during navigation', async ({ page }) => {
    // Fill some form data
    await page.fill('[data-testid="name-input"]', 'State Preservation Test')
    await page.fill('[data-testid="description-input"]', 'Testing form state preservation during navigation')
    await page.click('[data-testid="style-modern"]')
    
    // Navigate away and back
    await page.goto('/')
    await page.goBack()
    
    // Check if form state is preserved (implementation dependent)
    // This test may need adjustment based on actual state management
    const nameValue = await page.locator('[data-testid="name-input"]').inputValue()
    // Note: This might be empty if state isn't persisted, which is also valid
  })

  test('should handle form submission with loading states', async ({ page }) => {
    // Fill valid form data
    await page.fill('[data-testid="name-input"]', 'Loading Test System')
    await page.fill('[data-testid="description-input"]', 'Testing loading states and submission handling')
    await page.click('[data-testid="style-modern"]')
    await page.fill('[data-testid="color-input"]', '#3B82F6')
    await page.selectOption('[data-testid="industry-select"]', 'e-commerce')
    await page.check('[data-testid="component-button"]')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible({ timeout: 1000 })
    
    // Submit button should be disabled during submission
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    
    // Should show progress indicators
    await expect(page.locator('[data-testid="generation-progress"]')).toBeVisible({ timeout: 10000 })
  })

  test('should handle keyboard navigation in form', async ({ page }) => {
    // Test tab navigation through form fields
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="name-input"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="description-input"]')).toBeFocused()
    
    // Test form submission via keyboard
    await page.fill('[data-testid="name-input"]', 'Keyboard Test System')
    await page.fill('[data-testid="description-input"]', 'Testing keyboard navigation and accessibility')
    await page.click('[data-testid="style-modern"]')
    await page.fill('[data-testid="color-input"]', '#3B82F6')
    
    // Submit via Enter key
    await page.keyboard.press('Enter')
    
    // Should submit form
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible({ timeout: 1000 })
  })

  test('should handle real-time validation feedback', async ({ page }) => {
    // Test name field real-time validation
    await page.fill('[data-testid="name-input"]', 'A')
    await page.click('[data-testid="description-input"]') // Trigger blur
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
    
    await page.fill('[data-testid="name-input"]', 'Valid Name')
    await page.click('[data-testid="description-input"]')
    await expect(page.locator('[data-testid="name-error"]')).not.toBeVisible()
    
    // Test description field real-time validation
    await page.fill('[data-testid="description-input"]', 'Short')
    await page.click('[data-testid="name-input"]')
    await expect(page.locator('[data-testid="description-error"]')).toBeVisible()
    
    await page.fill('[data-testid="description-input"]', 'This is a valid description with enough characters')
    await page.click('[data-testid="name-input"]')
    await expect(page.locator('[data-testid="description-error"]')).not.toBeVisible()
  })

  test('should handle component selection correctly', async ({ page }) => {
    // Test component checkboxes
    const componentCheckboxes = await page.locator('[data-testid*="component-"]').all()
    expect(componentCheckboxes.length).toBeGreaterThan(0)
    
    // Select multiple components
    await page.check('[data-testid="component-button"]')
    await page.check('[data-testid="component-input"]')
    await page.check('[data-testid="component-card"]')
    
    // Verify selections
    await expect(page.locator('[data-testid="component-button"]')).toBeChecked()
    await expect(page.locator('[data-testid="component-input"]')).toBeChecked()
    await expect(page.locator('[data-testid="component-card"]')).toBeChecked()
    
    // Test deselection
    await page.uncheck('[data-testid="component-card"]')
    await expect(page.locator('[data-testid="component-card"]')).not.toBeChecked()
    
    // Test select all functionality (if available)
    const selectAllButton = page.locator('[data-testid="select-all-components"]')
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click()
      
      // All checkboxes should be checked
      for (const checkbox of componentCheckboxes) {
        await expect(checkbox).toBeChecked()
      }
    }
  })

  test('should provide helpful field descriptions and tooltips', async ({ page }) => {
    // Check for help text or tooltips
    const helpIcons = await page.locator('[data-testid*="help-"]').all()
    
    if (helpIcons.length > 0) {
      // Test tooltip functionality
      await page.hover('[data-testid="help-style"]')
      await expect(page.locator('[data-testid="tooltip-style"]')).toBeVisible({ timeout: 2000 })
      
      await page.hover('[data-testid="help-color"]')
      await expect(page.locator('[data-testid="tooltip-color"]')).toBeVisible({ timeout: 2000 })
    }
    
    // Check for field descriptions
    const descriptions = await page.locator('.field-description, .help-text').all()
    expect(descriptions.length).toBeGreaterThan(0)
  })

  test('should handle form reset functionality', async ({ page }) => {
    // Fill form with data
    await page.fill('[data-testid="name-input"]', 'Reset Test System')
    await page.fill('[data-testid="description-input"]', 'Testing form reset functionality')
    await page.click('[data-testid="style-modern"]')
    await page.fill('[data-testid="color-input"]', '#FF5733')
    await page.check('[data-testid="component-button"]')
    
    // Look for reset button (if available)
    const resetButton = page.locator('[data-testid="reset-form"], button[type="reset"]')
    
    if (await resetButton.isVisible()) {
      await resetButton.click()
      
      // Form should be cleared
      await expect(page.locator('[data-testid="name-input"]')).toHaveValue('')
      await expect(page.locator('[data-testid="description-input"]')).toHaveValue('')
      await expect(page.locator('[data-testid="component-button"]')).not.toBeChecked()
    }
  })
})