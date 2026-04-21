# DevOps Implementation Guide

Complete DevOps pipeline for deploying a Next.js application to Render.com with automated CI/CD using GitHub Actions.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Component Details](#component-details)
4. [Setup Instructions](#setup-instructions)
5. [Local Development](#local-development)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Git repository initialized
- GitHub account with repository access
- Node.js 20+ installed locally
- Docker installed (optional, for local testing)
- Render.com account

### One-time Setup (5 minutes)

1. **Get Render Deploy Hook**:
   ```bash
   # On Render Dashboard:
   # 1. Create Web Service (or select existing)
   # 2. Go to Settings → Deploy Hook
   # 3. Copy the URL
   ```

2. **Add GitHub Secret**:
   ```bash
   # In your GitHub repository:
   # 1. Settings → Secrets and variables → Actions
   # 2. New repository secret
   # 3. Name: RENDER_DEPLOY_HOOK
   # 4. Value: [paste from Render]
   ```

3. **Push to main**:
   ```bash
   git add .
   git commit -m "feat: add DevOps pipeline"
   git push origin main
   ```

4. **Watch Deployment**:
   - GitHub: Actions tab → ci-cd workflow
   - Render: Dashboard → Deployments tab

✅ **Done!** Your app will automatically deploy on every push to main.

---

## 🏗️ Architecture Overview

### Pipeline Flow

```
Developer Push to main
    ↓
GitHub Actions CI/CD
    ├─ Dependencies installed
    ├─ Linting (ESLint)
    ├─ Tests run (Vitest)
    ├─ Production build (Next.js)
    └─ Docker image created & pushed
    ↓
Render.com Deployment Hook
    ├─ Pull new Docker image
    ├─ Stop old container
    ├─ Start new container
    └─ Application Live
    ↓
Live on https://your-app.render.com
```

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Next.js | 16.1.6 |
| **Runtime** | Node.js | 20-alpine |
| **Language** | TypeScript | 5 |
| **Testing** | Vitest | 2 |
| **Linting** | ESLint | 9 |
| **CI/CD** | GitHub Actions | (native) |
| **Registry** | GitHub Container Registry | (free) |
| **Deployment** | Render.com | (PaaS) |
| **VCS** | Git | (native) |

---

## 📦 Component Details

### 1. Git Version Control

**Files**: `.git/`, `.gitignore`

**Key Features**:
- Tracks all code changes
- Enables collaborative development
- Provides deployment history via commits

**Usage**:
```bash
git add .                              # Stage changes
git commit -m "feat: description"      # Create commit
git push origin main                   # Push to GitHub
git log --oneline                      # View history
```

### 2. Local Testing with Vitest

**Files**: `vitest.config.ts`, `vitest.setup.ts`, `src/__tests__/*.test.ts`

**Features**:
- Unit tests for business logic
- Component tests for React elements
- Coverage reports
- Fast feedback loop

**Usage**:
```bash
npm run test              # Run tests (watch mode)
npm run test:ui          # Interactive UI
npm run test:coverage    # Coverage report
```

### 3. Docker Containerization

**Files**: `Dockerfile`, `.dockerignore`

**Build Stages**:
- Stage 1 (deps): Install dependencies
- Stage 2 (builder): Compile Next.js
- Stage 3 (runner): Minimal production image

**Benefits**:
- Consistent environment (local → CI → production)
- Reduced image size (~150MB with multi-stage)
- Security (non-root user, minimal dependencies)

**Usage**:
```bash
docker build -t app:latest .           # Build
docker run -p 3000:3000 app:latest    # Run locally
```

### 4. GitHub Actions CI/CD

**Files**: `.github/workflows/ci-cd.yml`, `.github/workflows/deploy.yml`

**Workflows**:

**CI/CD Workflow** (triggered on push/PR):
- Lint code (ESLint)
- Run tests (Vitest)
- Build application (Next.js)
- Build Docker image
- Push to GHCR
- Trigger Render deployment

**Deploy Workflow** (triggered on successful CI/CD):
- Call Render deploy hook
- Monitor deployment status

### 5. Render.com Deployment

**Configuration**: Web Service with Docker

**Features**:
- Auto-redeploy on Docker image push
- Free SSL certificates
- Environment variable management
- Build logs and monitoring

**Setup**:
1. Create Web Service
2. Connect GitHub repo
3. Select Docker (image from GHCR)
4. Generate Deploy Hook
5. Add to GitHub Secrets

---

## 🔧 Setup Instructions

### Phase 1: Initial Setup (Already Done ✅)

- ✅ Git repository initialized
- ✅ package.json configured with test scripts
- ✅ Vitest setup with configuration
- ✅ Sample tests created
- ✅ Dockerfile and multi-stage build
- ✅ GitHub Actions workflows created
- ✅ Documentation written

### Phase 2: GitHub Configuration (Do This Now 🔴)

1. **Verify Repository is on GitHub**:
   ```bash
   git remote -v
   # Should show: origin https://github.com/YOUR_USERNAME/YOUR_REPO
   ```

2. **Create Render.com Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select this repository
   - Name: `discount-app` (or preferred name)
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Plan: Free (or Starter)

3. **Generate Render Deploy Hook**:
   - Go to Service Settings → Deploy Hook
   - Copy URL (keep secure!)

4. **Add GitHub Secret**:
   - Repository Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `RENDER_DEPLOY_HOOK`
   - Value: [paste Render URL]
   - Save

### Phase 3: Test Pipeline (Do This Now 🔴)

1. **Make a Test Commit**:
   ```bash
   # Make a small code change
   echo "# Pipeline test" >> README.md
   
   git add .
   git commit -m "test: verify DevOps pipeline"
   git push origin main
   ```

2. **Monitor GitHub Actions**:
   - Go to Repository → Actions
   - Watch `CI/CD Pipeline` workflow
   - Verify all steps pass (lint → test → build → docker)

3. **Monitor Render Deployment**:
   - Go to Render Dashboard
   - Select your service
   - Watch Deployments tab
   - Wait for status: "Live"

4. **Verify Live Deployment**:
   - Copy your Render URL from dashboard
   - Open in browser: `https://your-service.render.com`
   - Verify application loads

✅ **Pipeline verified! Automatic deployments now active.**

---

## 💻 Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO
cd YOUR_REPO

# Install dependencies
npm install

# Create .env.local if needed (example)
# (This project has no required env vars currently)
```

### Development Server

```bash
npm run dev
# App runs on http://localhost:3000
# Auto-reloads on file changes
```

### Making Changes

```bash
# Make code changes
# Edit files...

# Test locally
npm run test              # Verify tests pass
npm run lint              # Check code quality
npm run build             # Test production build

# Commit and push
git add .
git commit -m "feat: description"
git push origin main

# Watch GitHub Actions and Render deployment
```

---

## 🧪 Testing

### Running Tests

```bash
# Run in watch mode (recommended during development)
npm run test

# Run once (CI mode, used in pipeline)
npm run test -- --run

# Interactive UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Files

Tests are located in `src/__tests__/`:
- `discounts.test.ts` - Business logic tests
- Add more as needed

### Writing Tests

Example test structure:

```typescript
import { describe, it, expect } from 'vitest';

describe('calculateCartTotal', () => {
  it('should calculate total for single item', () => {
    const items = [{ price: 100, quantity: 2, category: 'electronics' }];
    expect(calculateCartTotal(items)).toBe(200);
  });
});
```

---

## 📤 Deployment

### Automatic Deployment

Every push to `main` triggers:
1. GitHub Actions CI/CD checks
2. Docker image creation and push
3. Render deployment hook
4. Application deployment

**Timeline**: 5-10 minutes from push to live

### Manual Deployment

If needed, manually trigger deployment:

1. **In Render Dashboard**:
   - Select service
   - Click "Manual Deploy"
   - Select branch/commit
   - Click "Deploy"

2. **Via GitHub Actions**:
   - Go to Actions → ci-cd workflow
   - Click "Run workflow"
   - Select branch
   - Click green button

### Viewing Logs

**GitHub Actions Logs**:
1. Repository → Actions
2. Select workflow run
3. Click job to expand
4. View step outputs

**Render Logs**:
1. Render Dashboard → select service
2. Click "Logs" tab
3. View deployment and runtime logs

---

## 🆘 Troubleshooting

### Linting Fails

```bash
# See which files have issues
npm run lint

# Fix auto-fixable issues (when available)
npm run lint -- --fix
```

### Tests Fail

```bash
# Run tests locally
npm run test

# Debug specific test
npm run test -- discounts.test.ts

# View test UI
npm run test:ui
```

### Build Fails

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check Node modules
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Docker Build Fails

```bash
# Build locally to see error
docker build -t app:test .

# Common issues:
# - Missing dependencies (check package.json)
# - Incorrect start command (check Dockerfile)
# - Port conflicts (ensure 3000 is free)
```

### Render Deployment Fails

1. **Check Render logs**:
   - Dashboard → Logs tab
   - Look for startup errors

2. **Common issues**:
   - Port not 3000
   - NODE_ENV not set to production
   - Missing environment variables
   - Incorrect start command

3. **Solutions**:
   - Update Dockerfile/package.json
   - Add env vars to Render settings
   - Trigger manual redeploy

### Deploy Hook Not Triggered

1. **Verify secret exists**:
   - Repository Settings → Secrets
   - Check `RENDER_DEPLOY_HOOK` is present

2. **Test secret manually**:
   ```bash
   curl -X POST "YOUR_RENDER_HOOK_URL"
   ```

3. **Re-add secret if needed**:
   - Delete from GitHub
   - Get fresh URL from Render
   - Add again

---

## 📚 Additional Resources

### Documentation Files
- [GitHub Actions Workflows](/.github/workflows/README.md) - Detailed workflow docs
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Vitest Docs](https://vitest.dev/) - Testing framework

### External Links
- [GitHub Actions](https://docs.github.com/actions)
- [Render Deployment Hooks](https://render.com/docs/deploy-hooks)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---

## ✅ Checklist

### Setup Checklist
- [ ] Repository pushed to GitHub
- [ ] Render.com account created
- [ ] Render Web Service created
- [ ] Deploy Hook generated from Render
- [ ] GitHub Secret `RENDER_DEPLOY_HOOK` added
- [ ] Test commit pushed to main
- [ ] GitHub Actions workflow completed successfully
- [ ] Render deployment successful
- [ ] Application accessible at Render URL

### Development Checklist (for each change)
- [ ] Run `npm run lint` locally
- [ ] Run `npm run test -- --run` locally
- [ ] Run `npm run build` successfully
- [ ] Commit with meaningful message
- [ ] Push to main branch
- [ ] Monitor GitHub Actions
- [ ] Monitor Render deployment
- [ ] Verify changes live on production

---

**Last Updated**: April 2026
**Framework**: Next.js 16.1.6
**DevOps Stack**: GitHub Actions + Render.com + Docker
