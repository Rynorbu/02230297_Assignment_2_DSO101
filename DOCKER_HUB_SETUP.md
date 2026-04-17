# Docker Hub Setup Guide for TaskFlow

This guide will help you set up Docker Hub repositories for separate frontend and backend deployments.

## Step 1: Create Docker Hub Account

1. Go to https://hub.docker.com
2. Click "Sign Up"
3. Fill in your details:
   - Email
   - Username (this is important - you'll use it in the Jenkinsfile)
   - Password
4. Click "Sign Up"
5. Verify your email

**Save your username!** You'll need it soon.

---

## Step 2: Create Two Docker Hub Repositories

### Create Backend Repository:
1. Login to Docker Hub
2. Click your profile → "Repositories"
3. Click "Create Repository"
4. Fill in:
   - **Name:** `taskflow-backend`
   - **Description:** TaskFlow Backend - Express API with PostgreSQL
   - **Visibility:** Public
5. Click "Create"

Your backend repo URL: `https://hub.docker.com/r/YOUR_USERNAME/taskflow-backend`

### Create Frontend Repository:
1. Click "Create Repository" again
2. Fill in:
   - **Name:** `taskflow-frontend`
   - **Description:** TaskFlow Frontend - React Application
   - **Visibility:** Public
3. Click "Create"

Your frontend repo URL: `https://hub.docker.com/r/YOUR_USERNAME/taskflow-frontend`

---

## Step 3: Generate Docker Hub Access Token

1. Go to Docker Hub → Your Profile (top right)
2. Click "Account Settings"
3. Click "Security" on the left
4. Click "New Access Token"
5. Fill in:
   - **Token name:** `jenkins-deploy`
   - **Access permissions:** Select "Read & Write"
6. Click "Generate"
7. **COPY the token** (long string) - You won't see it again!

Example format: `dckr_pat_abcdefghijklmnop123...`

---

## Step 4: Add Docker Hub Credentials to Jenkins

1. Open Jenkins at `http://localhost:8080`
2. Go to **Manage Jenkins** → **Manage Credentials**
3. Click **System** on the left
4. Click **Global credentials** (unrestricted)
5. Click **"+ Add Credentials"** on the left
6. Fill in:
   - **Kind:** Username with password
   - **Username:** Your Docker Hub username
   - **Password:** Your Docker Hub access token (NOT your regular password!)
   - **ID:** `docker-hub-creds` (very important!)
   - **Description:** Docker Hub Credentials for TaskFlow
7. Click **Create**

---

## Step 5: Update Jenkinsfile with Your Username

Edit the Jenkinsfile in your repo:

```groovy
environment {
    DOCKER_USERNAME = 'your-dockerhub-username'  // ← Replace with YOUR username
    ...
}
```

Replace `your-dockerhub-username` with your actual Docker Hub username.

Example:
```groovy
DOCKER_USERNAME = 'rynorbu'
```

---

## Step 6: Push to GitHub

```bash
git add Jenkinsfile
git commit -m "Update Jenkinsfile with Docker Hub username"
git push origin main
```

---

## Step 7: Run Jenkins Pipeline

1. Open Jenkins
2. Open your TaskFlow pipeline
3. Click **"Build Now"**
4. Watch the stages:
   - ✅ Checkout
   - ✅ Install Dependencies
   - ✅ Run Tests
   - ✅ Build Backend Image
   - ✅ Build Frontend Image
   - ✅ Push Backend to Docker Hub
   - ✅ Push Frontend to Docker Hub

---

## Verification

After successful build, check Docker Hub:

**Backend Repository:**
- URL: `https://hub.docker.com/r/YOUR_USERNAME/taskflow-backend`
- You should see image tagged as `latest`

**Frontend Repository:**
- URL: `https://hub.docker.com/r/YOUR_USERNAME/taskflow-frontend`
- You should see image tagged as `latest`

---

## Using Your Docker Images

### Pull Backend:
```bash
docker pull YOUR_USERNAME/taskflow-backend:latest
docker run -p 5000:5000 YOUR_USERNAME/taskflow-backend:latest
```

### Pull Frontend:
```bash
docker pull YOUR_USERNAME/taskflow-frontend:latest
docker run -p 3000:80 YOUR_USERNAME/taskflow-frontend:latest
```

### Pull Both with Docker Compose:
```yaml
version: '3.8'
services:
  backend:
    image: YOUR_USERNAME/taskflow-backend:latest
    ports:
      - "5000:5000"
    
  frontend:
    image: YOUR_USERNAME/taskflow-frontend:latest
    ports:
      - "3000:80"
```

---

## Troubleshooting

**Issue:** "docker: command not found"
- Solution: Install Docker Desktop from docker.com

**Issue:** "Authentication failed"
- Check: Verify your Docker Hub credentials in Jenkins (Manage Jenkins → Credentials)
- Make sure credential ID is `docker-hub-creds`

**Issue:** "Repository not found"
- Verify you created both repositories on Docker Hub
- Check the repository names match what's in the Jenkinsfile

**Issue:** "No such file or directory: ./backend/Dockerfile"
- Make sure you pushed all files including backend/Dockerfile and frontend/Dockerfile

---

## Next Steps

1. ✅ Set up Docker Hub account
2. ✅ Create both repositories
3. ✅ Generate access token
4. ✅ Add credentials to Jenkins
5. ✅ Update Jenkinsfile with your username
6. ✅ Push to GitHub
7. ✅ Run Jenkins pipeline
8. ✅ Verify images on Docker Hub

You're ready to deploy! 🚀
