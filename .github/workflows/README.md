# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions to automate code quality checks, testing, Docker image building, and deployment to Render.com. The pipeline ensures every commit to the `main` branch is automatically tested, containerized, and deployed.

---

## Pipeline Architecture

```
Git Push to main
      ↓
[GitHub Actions] CI/CD Pipeline Job
      ├─ Checkout code
      ├─ Setup Node.js environment
      ├─ Install dependencies (npm ci)
      ├─ Run linting (ESLint)
      ├─ Run tests (Vitest)
      └─ Build production bundle (Next.js)
            ↓
         Success?
      ├─ YES → Build & Push Docker Image
      │          ├─ Build multi-stage Docker image
      │          ├─ Push to GitHub Container Registry (GHCR)
      │          └─ Trigger Render deployment hook
      │
      └─ NO → Stop (notify via GitHub checks)
            ↓
      [Render.com] Deployment
            ├─ Pull Docker image from GHCR
            ├─ Stop current service
            ├─ Start new container
            └─ Application Live!
```

---

## Workflows

### 1. CI/CD Pipeline Workflow (`.github/workflows/ci-cd.yml`)

**Trigger**: Push or Pull Request to `main` branch

**Jobs**:
- **lint-and-test**: Linting, testing, and building
  - Runs on: `ubuntu-latest`
  - Node.js version: 20
  - Cache: npm dependencies
  
- **build-and-push**: Build Docker image and push to registry
  - Runs only on: successful lint-and-test + push to main
  - Registry: GitHub Container Registry (GHCR)
  - Images tagged with: branch, commit SHA, and "latest"

**Required Secrets**: `RENDER_DEPLOY_HOOK` (optional, for automatic deployment)

---

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

**Trigger**: Successful CI/CD Pipeline workflow completion

**Job**:
- **deploy**: Trigger Render deployment
  - Runs only if CI/CD workflow succeeded
  - Calls Render's deploy hook URL
  - Provides deployment status link

**Required Secrets**: `RENDER_DEPLOY_HOOK`

---

## GitHub Secrets Setup

### Required Secret: `RENDER_DEPLOY_HOOK`

This secret contains the URL for triggering deployments on Render.

**Steps to get the Deploy Hook URL**:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your web service
3. Go to Settings → Deploy Hook
4. Copy the URL (format: `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`)

**Steps to add the secret to GitHub**:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `RENDER_DEPLOY_HOOK`
5. Value: Paste the Render deploy hook URL
6. Click "Add secret"

---

## Scripts Used in Pipeline

```bash
npm ci                # Clean install dependencies (faster, more reliable)
npm run lint          # Run ESLint for code quality
npm run test -- --run # Run Vitest in CI mode (no watch)
npm run build         # Build Next.js production bundle
docker build          # Build Docker image (multi-stage)
docker push           # Push image to GHCR
curl [deploy-hook]    # Trigger Render deployment
```

---

## Docker Image Details

**Build Process** (3 stages):
1. **deps**: Install dependencies
2. **builder**: Build Next.js application
3. **runner**: Minimal production image

**Base Image**: `node:20-alpine` (lightweight)

**Optimizations**:
- Multi-stage build reduces image size (~150MB)
- Uses `.dockerignore` to exclude unnecessary files
- Non-root user (nextjs) for security
- Standalone Next.js mode (no node_modules in production)

**Ports**: 3000 (HTTP)

**Environment**: NODE_ENV=production

---

## Running Tests Locally

Before pushing, test locally to catch issues early:

```bash
# Install dependencies
npm install

# Run all tests (watch mode)
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## Linting Locally

```bash
# Check for linting issues
npm run lint

# Fix auto-fixable issues (requires ESLint configuration)
npm run lint -- --fix
```

---

## Building Locally

```bash
# Create production build
npm run build

# Test production build locally
npm run start
```

---

## Docker Commands

```bash
# Build Docker image locally
docker build -t discount-app:latest .

# Run Docker container
docker run -p 3000:3000 discount-app:latest

# Access the app
open http://localhost:3000

# View Docker logs
docker logs <container-id>

# Stop container
docker stop <container-id>
```

---

## Pipeline Status & Monitoring

### View GitHub Actions Status

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select workflow or recent run
4. View logs for each step

### View Deployment Status

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your web service
3. View "Deployments" tab for history
4. Click deployment to see logs

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow fails at "lint" step | Run `npm run lint` locally to see issues, fix them, and re-push |
| Workflow fails at "test" step | Run `npm run test -- --run` locally, debug failures, and re-push |
| Workflow fails at "build" step | Run `npm run build` locally to see build errors |
| Docker build fails | Check `.dockerignore` and `Dockerfile`, ensure ports are correct |
| Render deployment fails | Check Render dashboard logs, verify deploy hook secret is set in GitHub |
| No deployment triggered | Ensure `RENDER_DEPLOY_HOOK` secret is added to GitHub Actions secrets |

---

## Environment Variables

### In GitHub Actions

Secrets are available as environment variables during workflow execution:

```yaml
env:
  NODE_ENV: production
  REGISTRY: ghcr.io
```

### In Render.com

Set environment variables in Render dashboard:
1. Go to Web Service → Settings → Environment
2. Add variables (e.g., `NODE_ENV=production`)
3. Restart service for changes to take effect

---

## Branching Strategy

Current setup assumes a simple branching strategy:
- **main** branch → production deployments
- PRs to main trigger CI checks (linting, testing, building) but skip Docker push and deployment

---

## Cost Considerations

### GitHub Actions
- Free tier includes 2,000 minutes/month
- This pipeline typically uses 3-5 minutes per run
- Estimated: ~60-100 runs/month (high volume)

### Docker Image Storage
- GitHub Container Registry: Free for public images
- GitHub Actions: Free for public repositories

### Render.com
- Free tier includes 1 web service with limited resources
- Deploy hook is free
- Refer to [Render pricing](https://render.com/pricing) for details

---

## Next Steps

1. ✅ Add `RENDER_DEPLOY_HOOK` secret to GitHub
2. ✅ Push a test commit to main
3. ✅ Watch GitHub Actions run the pipeline
4. ✅ Verify Render deployment succeeds
5. ✅ Access deployed app at Render URL

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Render Deployment Hooks](https://render.com/docs/deploy-hooks)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment/docker)
- [Vitest Documentation](https://vitest.dev/)
