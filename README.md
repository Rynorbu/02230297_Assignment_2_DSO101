# Assignment 2: Continuous Integration and Continuous Deployment (DSO101)

## Project Overview
**TaskFlow** - A modern, full-stack task management application with automated CI/CD pipeline using Jenkins.

- **Frontend:** React with dark theme UI
- **Backend:** Node.js Express API with PostgreSQL database
- **CI/CD:** Jenkins pipeline for automated build, test, and deployment
- **Containerization:** Docker and Docker Compose

---

## Pipeline Configuration

### Jenkins Setup
**Tools Configured:**
- NodeJS 18 LTS
- npm/yarn for package management
- Jest for unit testing
- Docker for containerization

**Plugins Installed:**
- NodeJS Plugin
- Pipeline
- GitHub Integration
- Docker Pipeline

### GitHub Integration
- **Repository:** https://github.com/Rynorbu/02230297_Assignment_2_DSO101
- **Branch:** main
- **Authentication:** GitHub Personal Access Token (PAT)

---

## Jenkinsfile Stages

### 1. **Checkout Stage**
```groovy
Clones the latest code from GitHub main branch
Repository: https://github.com/Rynorbu/02230297_Assignment_2_DSO101.git
Branch: */main
```
✅ Automatically fetches code on every build

### 2. **Install Stage**
```groovy
sh 'npm install'
```
✅ Installs all dependencies from package.json

### 3. **Build Stage**
```groovy
sh 'npm run build'
```
✅ Executes custom build script (runs index.js)

### 4. **Test Stage**
```groovy
sh 'npm test'
Post-action: Publishes junit.xml test results
```
✅ Runs Jest tests with JUnit reporter
✅ Test results visible in Jenkins dashboard

### 5. **Deploy Stage**
```groovy
docker build -t rynorbu/taskflow-app:latest .
docker push rynorbu/taskflow-app:latest
```
✅ Builds Docker image
✅ Pushes to Docker Hub registry

---

## Package.json Configuration

**Test Script:**
```json
"test": "jest --ci --reporters=default --reporters=jest-junit"
```
- Runs Jest in CI mode
- Generates JUnit XML reports for Jenkins

**Build Script:**
```json
"build": "node index.js"
```

**Dev Dependencies:**
- `jest` - Testing framework
- `jest-junit` - JUnit reporter for Jenkins
- `concurrently` - Run multiple scripts concurrently

---

## How to Run the Pipeline

### Step 1: Jenkins Setup
1. Install Jenkins from jenkins.io
2. Install required plugins (NodeJS, Pipeline, GitHub, Docker)
3. Configure Node.js in Manage Jenkins > Tools

### Step 2: GitHub Setup
1. Create GitHub Personal Access Token
2. Add to Jenkins Credentials with ID: `github-pat`

### Step 3: Docker Hub Setup (Optional)
1. Create Docker Hub account
2. Add credentials to Jenkins with ID: `docker-hub-creds`

### Step 4: Run Pipeline
1. In Jenkins: Create New Item > Pipeline
2. Configure:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository: https://github.com/Rynorbu/02230297_Assignment_2_DSO101.git
   - Script Path: Jenkinsfile
3. Click "Build Now"

---

## Challenges Faced & Solutions

### Challenge 1: Git Branch Reference Error
**Error:** `fatal: couldn't find remote ref refs/heads/master`

**Cause:** Jenkins was looking for `master` branch but repo uses `main`

**Solution:** 
```groovy
branches: [[name: '*/main']]  // Explicitly specified main branch
```

### Challenge 2: Test Report Publishing
**Challenge:** JUnit XML report not generating

**Solution:** 
```json
"test": "jest --ci --reporters=default --reporters=jest-junit"
```
Added `jest-junit` reporter to generate junit.xml

### Challenge 3: Docker Authentication
**Challenge:** Pushing to Docker Hub required credentials

**Solution:** 
```groovy
withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', ...)]) {
    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
}
```

---

## File Structure

```
02230297_Assignment_2_DSO101/
├── Jenkinsfile                 # CI/CD Pipeline configuration
├── package.json                # Root project config with test scripts
├── app.test.js                # Jest test file
├── index.js                    # Build entry point
├── docker-compose.yml          # Local development environment
├── backend/                    # Node.js Express API
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/                   # React application
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── README.md                   # This file
```

---

## Benefits of This CI/CD Setup

1. **Automation** - No manual build/test steps
2. **Consistency** - Same process every time
3. **Early Detection** - Catch bugs before deployment
4. **Continuous Testing** - Tests run on every commit
5. **Quality Gate** - Tests must pass before deployment
6. **Audit Trail** - Build history and logs preserved
7. **Docker Integration** - Containerized deployments

---

## Deliverables Completed

✅ Jenkinsfile with 5 stages (Checkout, Install, Build, Test, Deploy)
✅ package.json with Jest and JUnit reporter
✅ app.test.js with test suite
✅ GitHub repository with all files
✅ Docker integration for deployment
✅ README.md with configuration documentation
✅ Troubleshooting guide for common issues

---

## Next Steps

1. **Add Screenshots:**
   - Successful build in Jenkins
   - Test results dashboard
   - Docker image on Docker Hub

2. **Docker Hub Deployment:**
   - Push images to: https://hub.docker.com/r/rynorbu/taskflow-app

3. **Run Production Build:**
   - Execute "Build Now" in Jenkins
   - Verify all 5 stages turn green ✅

---

## Repository Link
👉 **GitHub:** https://github.com/Rynorbu/02230297_Assignment_2_DSO101

---

**Created by:** Ranjung Yeshi Norbu  
**Date:** April 18, 2026  
**Course:** DSO101 - Continuous Integration and Continuous Deployment