# End-to-End Testing Documentation

This directory contains end-to-end (E2E) tests for the AI Design System Generator application using Playwright.

## Test Structure

### Test Files

- **`landing-page.spec.ts`** - Tests for the landing page functionality
  - Page loading and performance
  - Navigation and accessibility
  - SEO optimization
  - Responsive design
  - Error handling

- **`form-interaction.spec.ts`** - Tests for design system form interactions
  - Form validation and error handling
  - Real-time feedback and user interactions
  - Keyboard navigation and accessibility
  - Component selection and form state management

- **`user-journey.spec.ts`** - Complete user workflow tests
  - End-to-end design system generation flow
  - Component playground interactions
  - Export functionality
  - Error scenarios and recovery

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Test Commands

```bash
# Run all E2E tests
npm run e2e

# Run tests with browser UI visible
npm run e2e:headed

# Run tests with interactive UI
npm run e2e:ui

# View test report
npm run e2e:report

# Run specific test file
npm run e2e landing-page.spec.ts

# Run tests in specific browser
npm run e2e -- --project=chromium
npm run e2e -- --project=firefox
npm run e2e -- --project=webkit
```

## Test Configuration

The Playwright configuration is defined in `playwright.config.ts`:

- **Test Directory**: `./e2e`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallel Execution**: Enabled for faster test runs
- **Auto-retry**: Configured for CI environments
- **Trace Collection**: On test failures for debugging

## Test Scenarios Covered

### 1. Landing Page Tests
- ✅ Page loading and basic functionality
- ✅ Navigation structure and links
- ✅ SEO meta tags and optimization
- ✅ Accessibility compliance (WCAG guidelines)
- ✅ Performance metrics and load times
- ✅ Responsive design across viewports
- ✅ Error handling for 404s and broken links

### 2. Form Interaction Tests
- ✅ Input validation (name, description, color formats)
- ✅ Real-time validation feedback
- ✅ Form submission and loading states
- ✅ Keyboard navigation and accessibility
- ✅ Component selection functionality
- ✅ Form state preservation
- ✅ Help text and tooltips
- ✅ Form reset functionality

### 3. User Journey Tests
- ✅ Complete design system generation workflow
- ✅ Form filling and submission process
- ✅ Generation progress tracking
- ✅ Component playground interactions
- ✅ Variant and size switching
- ✅ Export functionality and downloads
- ✅ Network error handling and recovery
- ✅ Browser navigation (back/forward)
- ✅ Mobile responsiveness
- ✅ Console error monitoring

## Best Practices

### Test Organization
- Each test file focuses on a specific area of functionality
- Tests are organized into logical describe blocks
- Test names clearly describe the expected behavior
- Setup and teardown are handled in beforeEach hooks

### Selectors
- Use data-testid attributes for reliable element selection
- Fallback to semantic selectors (role, label, text)
- Avoid fragile CSS selectors that may change frequently
- Use Playwright's built-in locator strategies

### Assertions
- Use Playwright's auto-waiting expect assertions
- Set appropriate timeouts for async operations
- Test both positive and negative scenarios
- Verify visual elements and user feedback

### Error Handling
- Test error states and recovery mechanisms
- Verify user-friendly error messages
- Test network failure scenarios
- Ensure graceful degradation

## Debugging

### Debug Failed Tests
```bash
# Run with debug mode
npm run e2e:headed

# Use Playwright Inspector
npx playwright test --debug

# Generate and view traces
npm run e2e:report
```

### Common Issues

1. **Selector Not Found**: Update selectors to match actual page structure
2. **Timing Issues**: Increase timeouts or add proper wait conditions
3. **Network Errors**: Ensure dev server is running and accessible
4. **Browser Issues**: Update browsers with `npx playwright install`

## CI/CD Integration

Tests are configured to run in CI environments with:
- Reduced parallelism for stability
- Automatic retries on failures
- Screenshot and video capture on failures
- HTML report generation for review

## Future Enhancements

- [ ] Visual regression testing with screenshots
- [ ] Performance testing with Lighthouse
- [ ] Cross-browser compatibility testing
- [ ] API testing for backend integration
- [ ] Load testing for high traffic scenarios
- [ ] Accessibility testing with axe-core
- [ ] Database state management for realistic testing

## Maintenance

### Regular Tasks
1. Update test selectors when UI changes
2. Add new tests for new features
3. Review and update test data
4. Monitor test execution times
5. Update browser versions regularly

### Test Health Monitoring
- Monitor test pass rates in CI
- Review flaky tests and improve stability
- Update timeouts and wait conditions as needed
- Maintain comprehensive test coverage

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Automation Patterns](https://playwright.dev/docs/test-patterns)
- [Debugging Guide](https://playwright.dev/docs/debug)