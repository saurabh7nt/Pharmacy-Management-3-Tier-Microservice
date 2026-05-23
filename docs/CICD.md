# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipelines for the Pharmacy Management System.

## Overview

The project uses **GitHub Actions** for automated CI/CD with separate workflows for each microservice:

- `frontend-service-ci.yml` - Frontend service pipeline
- `users-service-ci.yml` - User service pipeline
- `medicine-service-ci.yml` - Medicine service pipeline
- `order-service-ci.yml` - Order service pipeline

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Push/PR                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Security Scanning                          │
│  ┌──────────────┐              ┌──────────────┐             │
│  │   Gitleaks   │              │    Trivy     │             │
│  │Secret Scanner│              │  FS Scanner  │             │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Code Build                               │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ Maven Build  │              │  npm Build   │            │
│  │  (Backend)   │              │  (Frontend)  │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Docker Build & Push                            │
│  Multi-platform: linux/amd64, linux/arm64                   │
│  Push to Docker Hub                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Container Image Scanning                       │
│  Trivy vulnerability scan on built images                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              GitOps Update                                  │
│  Update image tags in ArgoCD repository                     │
│  Trigger automatic deployment                               │
└─────────────────────────────────────────────────────────────┘
```

## Pipeline Stages

### 1. Security Scanning

#### Gitleaks - Secret Detection
- **Purpose**: Detect hardcoded secrets, API keys, passwords
- **When**: On every push and pull request
- **Action**: Fails pipeline if secrets are found

```yaml
- uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
```

#### Trivy - Filesystem Scanning
- **Purpose**: Scan code dependencies for vulnerabilities
- **Severity**: HIGH, CRITICAL
- **Action**: Fails pipeline on vulnerabilities
- **Output**: SARIF report uploaded to GitHub Security tab

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@v0.36.0
  with:
    scan-type: 'fs'
    scan-ref: './backend/user-service/'
    format: 'table'
    severity: 'HIGH,CRITICAL'
    ignore-unfixed: true
    exit-code: '1'
```

### 2. Code Build

#### Backend Services (Maven)
- **Java Version**: 17
- **Build Tool**: Maven
- **Cache**: Maven dependencies cached
- **Steps**:
  1. Checkout code (sparse checkout for efficiency)
  2. Setup Java 17
  3. Cache Maven dependencies
  4. Build with Maven
  5. Run tests

```yaml
- name: Setup Java
  uses: actions/setup-java@v4
  with:
    java-version: '17'
    distribution: 'temurin'
    cache: 'maven'

- name: Build with Maven
  working-directory: ./backend
  run: mvn clean install -DskipTests
```

#### Frontend (npm)
- **Node Version**: 22
- **Build Tool**: Vite
- **Cache**: npm dependencies cached
- **Steps**:
  1. Checkout code
  2. Setup Node.js 22
  3. Cache npm dependencies
  4. Install dependencies with `npm ci`
  5. Build production bundle

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json

- name: Build frontend
  working-directory: ./frontend
  run: npm run build
```

### 3. Docker Build & Push

#### Multi-Platform Builds
- **Platforms**: linux/amd64, linux/arm64
- **Registry**: Docker Hub
- **Tags**: 
  - `latest` - Latest stable version
  - `<commit-sha>` - Specific commit version

```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v4

- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v4

- name: Build and push
  uses: docker/build-push-action@v7
  with:
    context: .
    file: ./backend/user-service/Dockerfile
    push: true
    platforms: linux/amd64,linux/arm64
    tags: |
      saurabh7nt/microservice-user-service:latest
      saurabh7nt/microservice-user-service:${{ github.sha }}
```

### 4. Container Image Scanning

#### Trivy - Image Scanning
- **Purpose**: Scan built Docker images for vulnerabilities
- **Severity**: HIGH, CRITICAL
- **Action**: Fails pipeline on vulnerabilities
- **Scope**: OS packages and application dependencies

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@v0.36.0
  with:
    scan-type: 'image'
    image-ref: 'saurabh7nt/microservice-user-service:${{ github.sha }}'
    severity: 'HIGH,CRITICAL'
    ignore-unfixed: true
    exit-code: '1'
    format: 'table'
```

### 5. GitOps Update

#### ArgoCD Integration
- **Purpose**: Update Kubernetes manifests with new image tags
- **Repository**: Separate GitOps repository
- **Process**:
  1. Checkout ArgoCD repository
  2. Update deployment YAML with new image tag
  3. Commit and push changes
  4. ArgoCD automatically syncs and deploys

```yaml
- name: Update image tag
  run: |
    IMAGE_TAG="${GITHUB_SHA}"
    sed -i "s|image: .*user-service:.*|image: ${DOCKER_IMAGE}:${IMAGE_TAG}|g" k8s/user-service/deployment.yml 
    git config user.name "GitHub Actions[CI Bot]"
    git config user.email "actions@github.com"
    git add k8s/user-service/deployment.yml
    git commit -m "Update microservice-user-service image to ${IMAGE_TAG}"
    git push origin main
```

## Workflow Triggers

### Push to Main Branch
```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'backend/user-service/**'
```

### Pull Requests
```yaml
on:
  pull_request:
    paths:
      - 'backend/user-service/**'
```

### Manual Trigger
```yaml
on:
  workflow_dispatch:
```

## Required Secrets

Configure these secrets in GitHub repository settings:

### Docker Hub
- `DOCKERHUB_USERNAME` - Docker Hub username (variable)
- `DOCKERHUB_TOKEN` - Docker Hub access token (secret)

### GitHub
- `GH_TOKEN` - GitHub Personal Access Token with repo access
  - Required for: Gitleaks, ArgoCD repository updates

### How to Add Secrets

1. Go to repository Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Add each required secret

## Pipeline Optimization

### Sparse Checkout
Only checkout necessary files to speed up pipeline:

```yaml
- name: Checkout required code files
  uses: actions/checkout@v6
  with:
    sparse-checkout: |
      backend/user-service
      backend/common
      backend/pom.xml
```

### Dependency Caching
Cache dependencies to reduce build time:

```yaml
# Maven cache
- uses: actions/setup-java@v4
  with:
    cache: 'maven'

# npm cache
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

### Parallel Jobs
Jobs run in parallel when possible:

```yaml
jobs:
  git-leaks:
    runs-on: ubuntu-latest
  
  trivy-scan:
    runs-on: ubuntu-latest
  
  code-build:
    needs: [git-leaks, trivy-scan]
```

## Security Best Practices

### 1. Secret Management
- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly
- Use least privilege access

### 2. Vulnerability Scanning
- Scan on every build
- Fail pipeline on HIGH/CRITICAL vulnerabilities
- Upload SARIF reports to GitHub Security tab
- Review and fix vulnerabilities promptly

### 3. Image Security
- Use official base images
- Multi-stage builds to reduce image size
- Scan images before deployment
- Sign images (future enhancement)

### 4. Access Control
- Limit who can trigger workflows
- Require PR reviews before merge
- Use branch protection rules
- Enable required status checks

## Monitoring Pipeline

### GitHub Actions Dashboard
- View workflow runs: `Actions` tab in repository
- Check job status and logs
- Download artifacts
- Re-run failed jobs

### Notifications
Configure notifications for:
- Failed builds
- Security vulnerabilities
- Deployment status

### Metrics
Track:
- Build success rate
- Average build time
- Deployment frequency
- Time to recovery

## Troubleshooting

### Common Issues

#### 1. Build Fails - Maven
```bash
# Check Maven logs
# Verify Java version
# Clear Maven cache
mvn dependency:purge-local-repository
```

#### 2. Docker Build Fails
```bash
# Check Dockerfile syntax
# Verify base image availability
# Check build context
```

#### 3. Image Push Fails
```bash
# Verify Docker Hub credentials
# Check repository permissions
# Verify image tag format
```

#### 4. Trivy Scan Fails
```bash
# Review vulnerability report
# Update dependencies
# Add exceptions if needed (.trivyignore)
```

#### 5. GitOps Update Fails
```bash
# Verify GH_TOKEN permissions
# Check ArgoCD repository access
# Verify file paths in sed command
```

## Pipeline Enhancements

### Future Improvements

1. **Testing**
   - Add unit test execution
   - Integration tests
   - Code coverage reports
   - Performance tests

2. **Quality Gates**
   - SonarQube integration
   - Code quality metrics
   - Test coverage thresholds
   - Linting checks

3. **Deployment Strategies**
   - Blue-green deployments
   - Canary releases
   - A/B testing
   - Rollback automation

4. **Notifications**
   - Slack integration
   - Email notifications
   - Status badges
   - Deployment announcements

5. **Advanced Security**
   - Image signing with Cosign
   - SBOM generation
   - License compliance checking
   - Runtime security scanning

## Example Workflow File

Complete example for User Service:

```yaml
name: users-service-ci

on:
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - 'backend/user-service/**'
      - 'backend/common/**'
  pull_request:
    paths:
      - 'backend/user-service/**'
      - 'backend/common/**'

jobs:
  git-leaks:
    name: gitleaks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}

  trivy-scan:
    name: trivy-scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v6
        with:
          sparse-checkout: |
            backend/user-service
            backend/common

      - name: Run Trivy scanner
        uses: aquasecurity/trivy-action@v0.36.0
        with:
          scan-type: 'fs'
          scan-ref: './backend/user-service/'
          format: 'table'
          severity: 'HIGH,CRITICAL'
          ignore-unfixed: true
          exit-code: '1'

      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: 'trivy-results.sarif'

  code-build:
    runs-on: ubuntu-latest
    needs: [git-leaks, trivy-scan]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'maven'
      - name: Build
        working-directory: ./backend
        run: mvn clean install -DskipTests

  docker-build:
    runs-on: ubuntu-latest
    needs: code-build
    steps:
      - uses: actions/checkout@v6
      - uses: docker/login-action@v4
        with:
          username: ${{ vars.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - uses: docker/setup-qemu-action@v4
      - uses: docker/setup-buildx-action@v4
      - uses: docker/build-push-action@v7
        with:
          context: .
          file: ./backend/user-service/Dockerfile
          push: true
          platforms: linux/amd64,linux/arm64
          tags: |
            ${{ vars.DOCKERHUB_USERNAME }}/microservice-user-service:latest
            ${{ vars.DOCKERHUB_USERNAME }}/microservice-user-service:${{ github.sha }}

  trivy-image-scan:
    runs-on: ubuntu-latest
    needs: docker-build
    steps:
      - uses: aquasecurity/trivy-action@v0.36.0
        with:
          scan-type: 'image'
          image-ref: '${{ vars.DOCKERHUB_USERNAME }}/microservice-user-service:${{ github.sha }}'
          severity: 'HIGH,CRITICAL'
          exit-code: '1'

  update-image-tag:
    runs-on: ubuntu-latest
    needs: trivy-image-scan
    steps:
      - uses: actions/checkout@v4
        with:
          repository: yourusername/K8s-ArgoCD
          ref: main
          token: ${{ secrets.GH_TOKEN }}
      - name: Update tag
        run: |
          sed -i "s|image: .*user-service:.*|image: ${{ vars.DOCKERHUB_USERNAME }}/microservice-user-service:${{ github.sha }}|g" k8s/user-service/deployment.yml
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add k8s/user-service/deployment.yml
          git commit -m "Update user-service to ${{ github.sha }}"
          git push
```

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Getting Started](./GETTING_STARTED.md)
- [Architecture](./ARCHITECTURE.md)

---

**Note**: Keep your CI/CD pipelines secure, fast, and reliable. Regularly review and update your workflows.