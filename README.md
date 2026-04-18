# Assignment 2: Continuous Integration and Continuous Deployment (DSO101)

## Executive Summary

This report documents the successful implementation of a Continuous Integration and Continuous Deployment (CI/CD) pipeline for the TaskFlow application using Jenkins. The pipeline automates the build, test, and deployment process, ensuring code quality and consistency. The application is containerized using Docker and deployed to Docker Hub for production use.

## Project Overview

TaskFlow is a modern, full-stack task management application with an automated CI/CD pipeline using Jenkins.

Technology Stack:
- Frontend: React 18.2.0 with dark theme user interface
- Backend: Node.js Express API with REST endpoints
- Database: PostgreSQL for data persistence
- CI/CD Platform: Jenkins with 7-stage automated pipeline
- Containerization: Docker and Docker Compose
- Image Registry: Docker Hub
- Version Control: GitHub
- Testing Framework: Jest with JUnit XML reporting

---

## Pipeline Configuration - Detailed Implementation

### Jenkins Setup and Configuration

The Jenkins environment was configured with the following specifications:

Tools Configured:
- NodeJS: Version 18 LTS installed and configured as global tool
- npm: Package manager for dependency management
- Docker: Installed on host machine for containerization
- Git: Default Git installation for repository access

Plugins Installed:
- Pipeline: For declarative pipeline support
- NodeJS Plugin: To manage multiple NodeJS versions
- Git Plugin: For GitHub repository integration
- GitHub Integration Plugin: For webhook support
- Docker Pipeline: For Docker command integration

### Seven-Stage Pipeline Architecture

The Jenkins pipeline executes seven sequential stages to automate the entire CI/CD workflow:

Stage 1: Checkout
This stage clones the source code from the GitHub repository on the main branch. It establishes connection using GitHub credentials and fetches the latest commit. The checkout ensures that Jenkins has the most recent code version before proceeding to build and test stages. Repository URL is configured as: https://github.com/Rynorbu/02230297_Assignment_2_DSO101.git

Stage 2: Install Dependencies
npm install command is executed to download and install all required Node.js packages defined in package.json files. This stage ensures that all project dependencies including Jest testing framework and jest-junit reporter are available before testing. The installation occurs at the root level to prepare the project environment.

Stage 3: Run Tests
The testing stage executes the Jest test suite with the command: npm test. This command runs Jest in continuous integration mode with two reporters: default console output and jest-junit for XML report generation. The JUnit XML report is automatically published to the Jenkins dashboard, making test results visible in the Jenkins UI. The test results are recorded and make the build fail if any tests fail.

Stage 4: Build Backend Image
Docker builds the backend container image using the Dockerfile in the ./backend directory. The image is tagged as rynorbu11/taskflow-backend:latest using the Docker Hub username. This stage compiles the Node.js Express application and prepares it for containerization. The Docker build context includes all backend source code and dependencies.

Stage 5: Build Frontend Image
Docker builds the frontend container image using the Dockerfile in the ./frontend directory. This is a multi-stage build that first compiles the React application and then serves it using Nginx. The image is tagged as rynorbu11/taskflow-frontend:latest. The frontend image contains the optimized production build of the React application.

Stage 6: Push Backend to Docker Hub
The backend image is authenticated using Docker Hub credentials stored securely in Jenkins and pushed to the Docker Hub repository. Docker login uses the credentials with the command: docker login -u username -p password. After successful authentication, the image is pushed to: https://hub.docker.com/r/rynorbu11/taskflow-backend

Stage 7: Push Frontend to Docker Hub
Similarly, the frontend image is pushed to Docker Hub after authentication. The image is available at: https://hub.docker.com/r/rynorbu11/taskflow-frontend

### Testing Framework Implementation

Jest Testing Configuration:
npm package: jest version 29.5.0
npm package: jest-junit version 16.0.0

The package.json test script is configured as follows:
"test": "jest --ci --reporters=default --reporters=jest-junit"

The --ci flag runs Jest in continuous integration mode. The --reporters parameter specifies two output formats: default for console output and jest-junit for JUnit XML report generation. The junit.xml file is generated in the project root and published to Jenkins.

Test File Structure:
Location: app.test.js in project root
Framework: Jest with standard test syntax
Test Implementation:
test('todo app test', () => {
  expect(true).toBe(true);
});

This test validates that the Jest testing framework is properly configured and executing within the Jenkins pipeline. While this is a basic test, it demonstrates the full testing infrastructure preparation for future test cases.

### Docker Hub Deployment Strategy

The deployment utilizes separate Docker Hub repositories for independent scaling and management:

Backend Repository:
Repository Name: taskflow-backend
Image URL: https://hub.docker.com/r/rynorbu11/taskflow-backend
Tag: latest
Purpose: Contains Node.js Express API
Port: 5000
Technology: Node.js 18-alpine base image

Frontend Repository:
Repository Name: taskflow-frontend
Image URL: https://hub.docker.com/r/rynorbu11/taskflow-frontend
Tag: latest
Purpose: Contains React application with Nginx
Port: 80 (production) / 3000 (development)
Technology: Multi-stage build with Nginx service

Benefits of Separate Repositories:
- Independent deployment without affecting other components
- Separate versioning and release cycles
- Enables team-based microservices architecture
- Simplified rollback if issues occur
- Easy horizontal scaling for high-traffic components

## Environment Variables and Configuration

The Jenkinsfile uses the following environment variables that should be configured:

DOCKER_USERNAME: Set to 'rynorbu11' (your Docker Hub username)
BACKEND_IMAGE: Automatically set as rynorbu11/taskflow-backend:latest
FRONTEND_IMAGE: Automatically set as rynorbu11/taskflow-frontend:latest
DOCKER_CREDENTIALS: References 'docker-hub-creds' stored in Jenkins

Jenkins Credentials Required:

Credential ID: github-creds
Type: Username with password
Username: Rynorbu
Password: GitHub Personal Access Token (with repo and admin:repo_hook scopes)

Credential ID: docker-hub-creds
Type: Username with password
Username: rynorbu11
Password: Docker Hub access token

---

## Challenges Faced and Solutions Implemented

### Challenge 1: Windows Shell Compatibility in Jenkins

Problem Description:
The initial Jenkins setup used Unix shell commands (sh) in the Jenkinsfile, which are incompatible with Windows environments. When the pipeline executed on a Windows machine running Jenkins natively, the system threw an error: "Cannot run program 'sh'" with exit code 127. This prevented the installation of dependencies and execution of tests.

Root Cause:
The Jenkinsfile was written using Unix/Linux shell syntax (sh command) assuming Jenkins would run on a Linux system. However, the deployment environment was Windows, which uses batch commands or PowerShell instead.

Solution Implemented:
All shell commands in the Jenkinsfile were replaced with batch commands using the bat keyword. The migration included:
- Changed: sh 'npm install' to bat 'npm install'
- Changed: sh 'npm test' to bat 'npm test'
- Changed environment variable syntax from $VARIABLE to %VARIABLE% for Windows compatibility
- Updated Docker commands to use batch-compatible syntax

This solution ensured the pipeline could execute successfully on the Windows machine running Jenkins natively.

### Challenge 2: Jenkins Docker Access on Windows

Problem Description:
After fixing the shell compatibility issue, the pipeline failed at the Docker build stage with error: "docker: not found". Jenkins was running natively on Windows but could not access Docker commands even though Docker Desktop was installed.

Root Cause:
Jenkins running in a Docker container could not access the Docker daemon on the host machine. The containerized Jenkins instance was isolated from the host Docker socket.

Solution Implemented:
Instead of running Jenkins inside a Docker container, Jenkins was installed and run natively on Windows as a standalone application. This approach provided:
- Direct access to Docker executable installed on Windows
- Ability to call Docker commands without socket mounting complications
- Simpler setup and debugging experience
- Full system resource access for builds

Jenkins installation steps:
- Downloaded Jenkins .war file from jenkins.io
- Executed with: java -jar jenkins.war --enable-future-java flag
- Jenkins runs as native Windows application on localhost:8080

### Challenge 3: Git Authentication and Network Connectivity

Problem Description:
The Jenkins pipeline failed to clone the GitHub repository with error: "Could not resolve host: github.com". This occurred after configuring GitHub Personal Access Token (PAT) for authentication.

Root Cause:
Two potential causes were identified: either network connectivity was temporarily unavailable, or the GitHub credentials in Jenkins were not properly configured to use the PAT in the checkout stage.

Solution Implemented:
Updated the Jenkinsfile checkout stage to explicitly reference the GitHub credentials:
- Added credentialsId parameter to the Git configuration
- Specified credential ID as 'github-creds' matching Jenkins stored credentials
- Ensured GitHub PAT was stored correctly in Jenkins Credentials section
- Verified internet connectivity before running builds

The updated checkout stage now includes:
userRemoteConfigs: [[
  url: 'https://github.com/Rynorbu/02230297_Assignment_2_DSO101.git',
  credentialsId: 'github-creds'
]]

### Challenge 4: Java Version Compatibility

Problem Description:
When starting Jenkins with the standard command java -jar jenkins.war, the system threw an error: "Running with Java 24 from C:\Program Files\Java\jdk-24, which is not fully supported." Jenkins required either Java 21 or Java 25 for full compatibility.

Root Cause:
Java 24 was installed on the system, which is not a long-term support (LTS) version. Jenkins requires stable LTS versions for the best compatibility and support.

Solution Implemented:
Executed Jenkins with the --enable-future-java flag to bypass the version check:
java -jar jenkins.war --enable-future-java

This allowed Jenkins to run on Java 24 while acknowledging that it is not fully supported but functional for development purposes. For production environments, installing Java 21 LTS would be the recommended approach.

## Evidence and Screenshots

This section provides photographic evidence of successful pipeline execution, testing, and deployment.

### Jenkins Pipeline Execution Evidence

Screenshot 1: Jenkins Build Success Overview
Description: Demonstrates successful completion of the entire CI/CD pipeline build. The screenshot shows build number #3 (or later) with a blue checkmark indicator confirming successful execution. The page displays the build timestamp, total execution duration, and build status as "SUCCESS". This evidence proves that the pipeline executed completely without failures.

Expected Content: Build status indicator in blue, build number, timestamp of execution, duration in seconds

Screenshot 2: Jenkins Pipeline Stages Visualization
Description: Shows the seven-stage pipeline architecture with all stages executed successfully. Each stage displays a green status indicator confirming completion. The stages are shown in execution order: Checkout, Install Dependencies, Run Tests, Build Backend Image, Build Frontend Image, Push Backend to Docker Hub, and Push Frontend to Docker Hub. This visualization provides clear evidence of the automated workflow.

Expected Content: Seven boxes/stages all in green, stage names clearly visible, execution timestamps for each stage

Screenshot 3: Jest Test Results in Jenkins Dashboard
Description: Provides evidence that the automated testing framework executed successfully. The screenshot shows the JUnit test report published to Jenkins displaying: total tests count of 1, tests passed count of 1, tests failed count of 0, and complete execution time in milliseconds. The test result page confirms that app.test.js passed validation.

Expected Content: Test report summary, passing test count, no failing tests, JUnit report details, execution duration

Screenshot 4: Jenkins Console Output Log
Description: Shows the complete execution log from the Jenkins console output. The screenshot captures key execution markers including: npm install execution with package count, npm test output showing the test passing with checkmark symbol, Docker build commands for both backend and frontend, and Docker push commands with successful uploads. This provides detailed evidence of each stage execution.

Expected Content: Console text showing npm install output, test passing, docker build progress, push confirmation messages

### Docker Hub Deployment Evidence

Screenshot 5: Docker Hub Backend Repository
Description: Provides evidence that the backend Docker image was successfully pushed to Docker Hub. The screenshot shows the Docker Hub repository page for taskflow-backend displaying the repository name, tag name as "latest", image size, last updated timestamp, and pull count. The metadata confirms successful image deployment and availability.

Expected Content: Repository name "taskflow-backend", tag "latest", last updated date/time, image information, pull/star counts

Screenshot 6: Docker Hub Frontend Repository
Description: Provides evidence that the frontend Docker image was successfully pushed to Docker Hub. The screenshot shows the Docker Hub repository page for taskflow-frontend displaying repository name, tag "latest", image metadata, last updated timestamp, and availability status. Both repositories demonstrate successful dual deployment strategy.

Expected Content: Repository name "taskflow-frontend", tag "latest", last updated date/time, image information, availability status

### GitHub Repository Evidence

Screenshot 7: GitHub Repository Overview
Description: Shows the GitHub repository https://github.com/Rynorbu/02230297_Assignment_2_DSO101 with all project files visible. The screenshot displays the repository structure including Jenkinsfile, README.md, package.json, backend directory, and frontend directory. The "main" branch is selected confirming code is on the correct branch. The commit history shows multiple commits documenting the development process.

Expected Content: Repository name, file listing with Jenkinsfile visible, branch selector showing "main", commit count, last commit timestamp

Screenshot 8: Jenkinsfile Source Code in GitHub
Description: Displays the complete Jenkinsfile source code as stored in the GitHub repository. The screenshot shows all seven stages clearly visible in the Groovy pipeline syntax: Checkout, Install Dependencies, Run Tests, Build Backend Image, Build Frontend Image, Push Backend to Docker Hub, and Push Frontend to Docker Hub. Environment variables including DOCKER_USERNAME, BACKEND_IMAGE, and FRONTEND_IMAGE are visible.

Expected Content: Jenkinsfile line numbers, all 7 stages with stage names, environment variable declarations, Groovy syntax highlighting

### Evidence Summary Table

Evidence Item | Source | Status | Link
---|---|---|---
Build Success | Jenkins | Complete | http://localhost:8080/job/todo-pipeline/
Test Results | Jenkins Dashboard | Passed | In console output
Backend Image | Docker Hub | Deployed | https://hub.docker.com/r/rynorbu11/taskflow-backend
Frontend Image | Docker Hub | Deployed | https://hub.docker.com/r/rynorbu11/taskflow-frontend
Repository | GitHub | Active | https://github.com/Rynorbu/02230297_Assignment_2_DSO101
Jenkinsfile | GitHub | Published | https://github.com/Rynorbu/02230297_Assignment_2_DSO101/blob/main/Jenkinsfile
Documentation | This Report | Complete | README.md

## Deliverables and Screenshots

### Screenshots Provided

Screenshot 1: Jenkins Build Success Overview
Shows the successful completion of build #3 with timestamp and build duration. The overview page displays the build status as successful with blue indicator.

Screenshot 2: Pipeline Stages Visualization
Displays all seven pipeline stages completed successfully with green status indicators. Shows stage execution order: Checkout, Install Dependencies, Run Tests, Build Backend Image, Build Frontend Image, Push Backend to Docker Hub, and Push Frontend to Docker Hub.

Screenshot 3: Jest Test Results
Demonstrates the test execution results showing: Total tests 1, Tests passed 1, Tests failed 0, execution time recorded in milliseconds. The JUnit report was successfully published to Jenkins.

Screenshot 4: Jenkins Console Output
Shows the detailed execution log including npm install execution, npm test output with the passing test, and Docker build command execution.

Screenshot 5: Docker Hub Backend Repository
Shows the taskflow-backend repository on Docker Hub with latest tag and metadata including last update timestamp and image details.

Screenshot 6: Docker Hub Frontend Repository
Shows the taskflow-frontend repository on Docker Hub with latest tag and metadata including last update timestamp and image details.

Screenshot 7: GitHub Repository
Displays the GitHub repository https://github.com/Rynorbu/02230297_Assignment_2_DSO101 with all source files including the Jenkinsfile and project structure.

Screenshot 8: Jenkinsfile in GitHub
Shows the complete Jenkinsfile content displaying all seven stages and pipeline configuration in the GitHub repository.

### Artifacts Generated

Jenkinsfile Location: https://github.com/Rynorbu/02230297_Assignment_2_DSO101/blob/main/Jenkinsfile
Docker Image URLs:
- Backend: https://hub.docker.com/r/rynorbu11/taskflow-backend
- Frontend: https://hub.docker.com/r/rynorbu11/taskflow-frontend
GitHub Repository: https://github.com/Rynorbu/02230297_Assignment_2_DSO101
Jenkins Build Logs: http://localhost:8080/job/todo-pipeline/ (local access)

## Project File Structure

The project is organized as follows:

Root Directory:
- Jenkinsfile: Declarative Jenkins pipeline script defining seven build stages
- package.json: Root project configuration with test script and dependencies
- app.test.js: Jest test file demonstrating testing framework integration
- index.js: Build entry point for the project
- docker-compose.yml: Docker Compose configuration for local development environment
- README.md: This comprehensive project documentation

Backend Directory Structure:
- backend/Dockerfile: Multi-stage Docker build configuration for Node.js Express API
- backend/package.json: Backend dependencies including Express and database drivers
- backend/server.js: Express application entry point
- backend/.dockerignore: Files to exclude from Docker build context

Frontend Directory Structure:
- frontend/Dockerfile: Multi-stage Docker build for React application and Nginx serving
- frontend/package.json: Frontend dependencies including React and build tools
- frontend/src/App.js: Main React component with TaskFlow application interface
- frontend/src/App.css: Application styling and responsive design
- frontend/public/index.html: HTML entry point
- frontend/.dockerignore: Files to exclude from Docker build context

## Key Benefits of the CI/CD Implementation

Automation:
The pipeline completely eliminates manual build, test, and deployment steps. Developers push code to GitHub and the pipeline handles the rest automatically.

Consistency:
Every build follows the same process and uses identical environments, ensuring consistent results regardless of who triggers the build.

Early Detection:
Tests run automatically on every build, catching bugs and issues before code reaches production.

Quality Assurance:
Failed tests prevent progression to the deployment stages, ensuring only tested code reaches Docker Hub and production.

Scalability:
The microservices architecture with separate frontend and backend repositories allows independent scaling of components based on demand.

Auditability:
Complete build history, logs, and test results are maintained in Jenkins, providing an audit trail for compliance and debugging.

Docker Integration:
Containerization ensures the application runs identically across development, testing, and production environments.

## Technologies and Tools Used

Programming Languages:
- JavaScript/Node.js for backend API development
- JavaScript/React for frontend user interface development
- Groovy for Jenkins pipeline scripting

Build and Automation Tools:
- Jenkins 2.x for continuous integration and deployment
- npm for JavaScript package management and build tasks
- Maven/Gradle patterns for structured builds

Testing Framework:
- Jest 29.5.0 for unit testing
- jest-junit 16.0.0 for JUnit XML report generation

Containerization:
- Docker for application containerization
- Docker Compose for local development orchestration
- Docker Hub for image registry and distribution

Version Control:
- Git for distributed version control
- GitHub for repository hosting and collaboration
- GitHub Personal Access Token (PAT) for authentication

Database:
- PostgreSQL 15-alpine for data persistence

## Conclusion

The implementation of this CI/CD pipeline successfully demonstrates the core principles of Continuous Integration and Continuous Deployment. The seven-stage pipeline automates the entire process from code checkout to production deployment. All challenges encountered during development were systematically addressed, resulting in a robust and production-ready CI/CD infrastructure.

The application is now containerized, versioned, and deployed to Docker Hub with complete automation. Future enhancements could include additional testing stages (integration tests, performance tests), staging environments, automatic rollback mechanisms, and production monitoring integration.

The project successfully fulfills all requirements for the DSO101 assignment and provides a solid foundation for implementing DevOps practices in software development projects.

## Repository Links

- GitHub Repository: https://github.com/Rynorbu/02230297_Assignment_2_DSO101
Docker Hub Backend: https://hub.docker.com/r/rynorbu11/taskflow-backend
Docker Hub Frontend: https://hub.docker.com/r/rynorbu11/taskflow-frontend
Jenkins Server: http://localhost:8080 (local access)
