pipeline {
    agent any 
    
    environment {
        // Docker Hub credentials stored in Jenkins
        DOCKER_CREDENTIALS = 'my-devops'  // Using the ID of your created credentials
        DOCKER_USERNAME = 'pavithra0228'  // Your Docker Hub username
    }
    
    stages {
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/PavithraJayarathna/movieapp.git'
                }
            }
        }
        
        stage('Build Docker Image for Frontend') {
            steps {
                script {
                    // Build the frontend Docker image
                    bat 'docker build -t pavithra0228/movieapp-backend-frontend:%BUILD_NUMBER% ./movieapp-frontend'
                }
            }
        }

        stage('Build Docker Image for Backend') {
            steps {
                script {
                    // Build the backend Docker image
                    bat 'docker build -t pavithra0228/movieapp-backend-backend:%BUILD_NUMBER% ./movieapp-backend'
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: DOCKER_CREDENTIALS, variable: 'DOCKER_PASSWORD')]) {
                    script {
                        bat "docker login -u ${DOCKER_USERNAME} -p %DOCKER_PASSWORD%"
                    }
                }
            }
        }

        stage('Push Frontend Image') {
            steps {
                script {
                    // Push the frontend image to Docker Hub
                    bat 'docker push pavithra0228/movieapp-backend-frontend:%BUILD_NUMBER%'
                }
            }
        }
        
        stage('Push Backend Image') {
            steps {
                script {
                    // Push the backend image to Docker Hub
                    bat 'docker push pavithra0228/movieapp-backend-backend:%BUILD_NUMBER%'
                }
            }
        }
    }
    
    post {
        always {
            bat 'docker logout'
        }
    }
}
