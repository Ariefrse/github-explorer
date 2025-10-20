# Security Guidelines

## Environment Variables Management

This application uses environment variables to configure GitHub API access. Follow these security best practices:

### ✅ **Secure Practices**

1. **Never commit `.env` files** - All `.env*` files are included in `.gitignore`
2. **Use environment-specific files** - Different files for development, staging, and production
3. **Set secrets in deployment platform** - Use Netlify environment variables for production

### 🔐 **Environment Variables**

| Variable | Purpose | Exposure Risk | Recommended Handling |
|----------|---------|---------------|---------------------|
| `VITE_GITHUB_TOKEN` | GitHub Personal Access Token (dev only) | **High** if exposed | **Development only**, never in production |
| `VITE_APP_NAME` | Application name | Low | Safe to use |
| `VITE_APP_VERSION` | Application version | Low | Safe to use |
| `VITE_PER_PAGE` | Results per page | Low | Safe to use |

**Security Note**: GitHub API URLs and versions are now hardcoded in the application to prevent secret exposure.

### 🚀 **Deployment Security**

#### ⚠️ **CRITICAL SECURITY WARNING**
**DO NOT SET `VITE_GITHUB_TOKEN` IN BUILD ENVIRONMENT!**

Vite embeds all `VITE_` environment variables directly into the client-side JavaScript bundle during build time. This means any token set during the build process will be exposed to anyone who can access your website.

#### ✅ **Correct Approach for Netlify**

For secure deployment, the GitHub API configuration is now hardcoded in the application:

1. **Recommended Secure Deployment**
   - No environment variables needed for GitHub API in Netlify
   - API base URL and version are hardcoded for security
   - This will use GitHub's public rate limits (60 requests/hour per IP)

2. **Development Only**
   - You can optionally set `VITE_GITHUB_TOKEN` for local development
   - Never set this in production/Netlify environment
   - The token will be embedded in client-side JavaScript if set during build

3. **Higher Rate Limits Option**
   - Create a serverless function that proxies GitHub API requests
   - Store the token in Netlify environment variables (not prefixed with `VITE_`)
   - Never expose the token to client-side code

#### 🔧 **Current Implementation Risk**
If you build the application with `VITE_GITHUB_TOKEN` set, the token will be embedded in the JavaScript bundle and visible in browser developer tools.

#### GitHub Token Security
- **Scope**: Use minimum required scope (`public_repo` for public repositories)
- **Rotation**: Rotate tokens regularly
- **Storage**: Never store tokens in client-side code or public repositories
- **Expiration**: Use short-lived tokens when possible

### 📋 **Security Checklist**

- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] Environment variables set in deployment platform
- [ ] GitHub token has minimum required scope
- [ ] Build output doesn't contain sensitive data
- [ ] Regular token rotation schedule

### ⚠️ **Important Notes**

1. **Client-side exposure**: Since this is a client-side application, the GitHub token will be visible in the browser's developer tools. This is acceptable for public repository access but ensures:
   - Use read-only permissions
   - Don't use tokens with administrative privileges
   - Consider rate limiting implications

2. **Rate limiting**: Without a token, GitHub API is limited to 60 requests/hour per IP. With a token, it increases to 5,000 requests/hour per token.

### 🔍 **Security Monitoring**

Monitor your GitHub token usage:
- Check GitHub's "Personal access tokens" page for usage statistics
- Set up alerts for unusual activity
- Revoke compromised tokens immediately

## Build Security

The build process is configured to:
- Exclude environment variables from build output
- Only embed `VITE_` prefixed variables at build time
- Prevent sensitive data exposure in JavaScript bundles

Run `npm run build` and `npm run preview` to verify no secrets are exposed before deployment.