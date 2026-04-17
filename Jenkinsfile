pipeline {
    agent any
    tools {
        nodejs 'NodeJS'
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
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'junit.xml'
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    // Build Docker image
                    sh 'docker build -t rynorbu/taskflow-app:latest .'
                    
                    // Push to Docker Hub (requires credentials)
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker push rynorbu/taskflow-app:latest
                            docker logout
                        '''
                    }
                }
            }
        }
    }
}
