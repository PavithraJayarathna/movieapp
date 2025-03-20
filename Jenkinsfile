pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS = 'my-docker-password'  // Jenkins credential ID
        DOCKER_USERNAME = 'pavithra0228'  // Your Docker Hub username
        EC2_IP = 'ec2-18-212-53-48.compute-1.amazonaws.com'  // EC2 public IP
        PEM_KEY_PATH = 'C:/Users/pavit/Downloads/aws/movie_app.pem'  // Path to your PEM key for EC2
    }

    stages {
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/PavithraJayarathna/movieapp.git'
                }
            }
        }

        stage('Docker Build & Push in Parallel') {
            parallel {
                stage('Frontend Docker Build & Push') {
                    stages {
                        stage('Build Frontend Image') {
                            steps {
                                script {
                                    // Build Docker image for frontend
                                    bat 'docker build -t pavithra0228/movieapp-frontend:%BUILD_NUMBER% ./movieapp-frontend'
                                }
                            }
                        }

                        stage('Push Frontend Image') {
                            steps {
                                withCredentials([string(credentialsId: DOCKER_CREDENTIALS, variable: 'DOCKER_PASSWORD')]) {
                                    script {
                                        // Login to Docker and push the frontend image
                                        bat "docker login -u ${DOCKER_USERNAME} -p %DOCKER_PASSWORD%"
                                        bat 'docker push pavithra0228/movieapp-frontend:%BUILD_NUMBER%'
                                    }
                                }
                            }
                        }
                    }
                }

                stage('Backend Docker Build & Push') {
                    stages {
                        stage('Build Backend Image') {
                            steps {
                                script {
                                    // Build Docker image for backend
                                    bat 'docker build -t pavithra0228/movieapp-backend:%BUILD_NUMBER% ./movieapp-backend'
                                }
                            }
                        }

                        stage('Push Backend Image') {
                            steps {
                                withCredentials([string(credentialsId: DOCKER_CREDENTIALS, variable: 'DOCKER_PASSWORD')]) {
                                    script {
                                        // Login to Docker and push the backend image
                                        bat "docker login -u ${DOCKER_USERNAME} -p %DOCKER_PASSWORD%"
                                        bat 'docker push pavithra0228/movieapp-backend:%BUILD_NUMBER%'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        /*stage('Build Error Checking') {
            steps {
                script {
                    try {
                        // Linting for frontend using ESLint
                        echo 'Linting Frontend...'
                        sh 'cd movieapp && npm run lint'  // Run linting for frontend

                        // Linting for backend using ESLint (optional)
                        echo 'Linting Backend...'
                        sh 'cd movieapp-backend && npm run lint'  // Run linting for backend
                    } catch (Exception e) {
                        currentBuild.result = 'FAILURE'
                        error "Build error: Linting failed."
                    }
                }
            }
        }

        stage('Automated Tests') {
            steps {
                script {
                    try {
                        // Run unit tests for the frontend
                        echo 'Running Frontend Tests...'
                        sh 'cd movieapp && npm run test'  // Run tests for frontend

                        // Run backend tests (if implemented, currently only echoing)
                        echo 'Running Backend Tests...'
                        sh 'cd movieapp-backend && npm run test'  // Run tests for backend
                    } catch (Exception e) {
                        currentBuild.result = 'FAILURE'
                        error "Automated tests failed."
                    }
                }
            }
        }*/

        stage('Deploy to EC2') {
            steps {
                echo 'Deploying the application to EC2...'

                // SCP the docker-compose.yml file to EC2
                sh "scp -i ${PEM_KEY_PATH} ./docker-compose.yml ubuntu@${EC2_IP}:/home/ubuntu/app/"

                // SSH into EC2 and run docker-compose to start the application
                sh "ssh -i ${PEM_KEY_PATH} ubuntu@${EC2_IP} 'docker-compose up -d'"
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
