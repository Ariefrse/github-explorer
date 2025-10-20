# Deployment Guide

## 🚀 Netlify Deployment

### ✅ **Secure Deployment Configuration**

**Important**: Your application has been secured to prevent secret exposure. Do not set any GitHub API environment variables in Netlify.

#### Step 1: Deploy to Netlify

1. **Connect your repository to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select the `github-explorer` repository

#### Step 2: Configure Build Settings

**Build Settings:**
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### Step 3: Environment Variables (SECURE CONFIGURATION)

**Only set these safe environment variables:**
```
VITE_APP_NAME=DevHub Explorer
VITE_APP_VERSION=1.0.0
VITE_PER_PAGE=20
```

**🚨 DO NOT SET THESE VARIABLES:**
- ❌ `VITE_GITHUB_API_BASE_URL` (now hardcoded)
- ❌ `VITE_GITHUB_API_VERSION` (now hardcoded)
- ❌ `VITE_GITHUB_TOKEN` (security risk)

#### Step 4: Deploy

Click "Deploy site" to deploy your application securely.

### 🔐 **Security Notes**

1. **No Token Required**: The app works perfectly with GitHub's public API
2. **Rate Limits**: 60 requests per hour per IP address
3. **No Secrets**: No sensitive data is embedded in the build output

### 🧪 **Testing After Deployment**

1. Visit your deployed site
2. Test the search functionality
3. Verify the export features work
4. Check dark mode toggle
5. Test bookmark functionality

## 🔧 **Development Setup**

### Local Development with Token (Optional)

If you want higher rate limits during development:

1. Create a `.env` file locally:
   ```
   VITE_GITHUB_TOKEN=ghp_your_development_token_here
   ```

2. **Never commit this file** - it's already in `.gitignore`

3. Run development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

The build will automatically exclude any sensitive information and use secure defaults.

## 📊 **Alternative Approaches for Higher Rate Limits**

### Option 1: Serverless Function

Create a Netlify function to proxy GitHub API requests:

1. Create `netlify/functions/github-proxy.js`
2. Store your token in Netlify environment variables (without `VITE_` prefix)
3. Modify your app to call your proxy instead of GitHub API directly

### Option 2: Backend Service

Set up a backend service that:
- Handles GitHub API calls with authentication
- Provides a simple REST API for your frontend
- Manages rate limiting and caching

## 🚨 **Troubleshooting**

### Build Fails with Secrets Error

If you see "Secrets scanning found secrets in build":

1. **Remove all GitHub environment variables** from Netlify
2. **Check your local .env file** - remove any GitHub variables
3. **Rebuild locally**: `npm run build`
4. **Redeploy** to Netlify

### API Rate Limit Issues

- **Public API**: 60 requests/hour per IP
- **Development**: Use `VITE_GITHUB_TOKEN` locally only
- **Production**: Consider serverless proxy for higher limits

### App Not Loading

1. Check build logs in Netlify
2. Verify environment variables
3. Ensure `npm run build` completes successfully
4. Check browser console for JavaScript errors

## 📈 **Monitoring**

### Netlify Analytics

Enable Netlify Analytics to monitor:
- Page views
- User engagement
- Performance metrics

### GitHub API Usage

Monitor your API usage in GitHub settings:
- Check rate limit status
- Monitor token usage (if using)
- Set up alerts for unusual activity

---

**Security First**: This deployment guide prioritizes security over convenience. Your application will work securely without any exposed secrets.