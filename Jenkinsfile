pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
    }
    environment {
        DOCKER_USERNAME = 'your-dockerhub-username'  // ← REPLACE WITH YOUR USERNAME
        BACKEND_IMAGE = "${DOCKER_USERNAME}/taskflow-backend:latest"
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/taskflow-frontend:latest"
        DOCKER_CREDENTIALS = 'docker-hub-creds'  // Jenkins credential ID
    }
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/Rynorbu/02230297_Assignment_2_DSO101.git'
                    ]]
                ])
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'junit.xml'
                }
            }
        }
        stage('Build Backend Image') {
            steps {
                script {
                    sh "docker build -t ${BACKEND_IMAGE} ./backend"
                }
            }
        }
        stage('Build Frontend Image') {
            steps {
                script {
                    sh "docker build -t ${FRONTEND_IMAGE} ./frontend"
                }
            }
        }
        stage('Push Backend to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker push ''' + "${BACKEND_IMAGE}" + '''
                            docker logout
                        '''
                    }
                }
            }
        }
        stage('Push Frontend to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker push ''' + "${FRONTEND_IMAGE}" + '''
                            docker logout
                        '''
                    }
                }
            }
        }
    }
    post {
        always {
            echo "Pipeline execution completed!"
        }
        success {
            echo "✅ All stages passed! Check Docker Hub repositories:"
            echo "Backend: https://hub.docker.com/r/${DOCKER_USERNAME}/taskflow-backend"
            echo "Frontend: https://hub.docker.com/r/${DOCKER_USERNAME}/taskflow-frontend"
        }
        failure {
            echo "❌ Pipeline failed. Check logs above."
        }
    }
}
