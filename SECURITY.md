# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of our AI Design System Generator seriously. If you have discovered a security vulnerability, please follow these steps:

### 1. Do NOT disclose publicly

Please do not disclose the vulnerability publicly until we have had a chance to address it.

### 2. Email us directly

Send details to: security@ai-design-system-generator.com (or create a private security advisory on GitHub)

### 3. Include details

Please include as much information as possible:

- Type of vulnerability
- Affected components
- Steps to reproduce
- Potential impact
- Suggested fixes (if any)

### 4. Response timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 5 business days
- **Fix timeline**: Depends on severity
  - Critical: 7-14 days
  - High: 14-30 days
  - Medium: 30-60 days
  - Low: Next regular release

## Security Measures

Our application implements the following security measures:

### API Security

- Rate limiting (20 req/min general, 5 req/5min for AI generation)
- Input validation using Zod schemas
- Sanitization of user inputs
- API key authentication (when configured)
- CORS protection with origin validation

### Application Security

- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS) in production
- XSS Protection headers
- Secure cookie handling

### Dependency Security

- Daily automated security scans via GitHub Actions
- npm audit checks on every build
- Snyk vulnerability scanning
- CodeQL static analysis
- License compatibility checks

### Data Protection

- No storage of user prompts or generated content
- Environment-based configuration
- Secure handling of API keys
- No tracking or analytics without consent

## Best Practices for Users

1. **API Keys**: Never expose API keys in client-side code
2. **Environment Variables**: Use `.env.local` for sensitive configuration
3. **Updates**: Keep dependencies up to date
4. **HTTPS**: Always use HTTPS in production
5. **Authentication**: Implement proper authentication for production use

## Security Headers

The application sets the following security headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: [comprehensive policy]
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help us improve our security.
