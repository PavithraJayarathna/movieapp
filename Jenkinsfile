pipeline {
    agent any 
    
    environment {
        DOCKER_CREDENTIALS = 'my-docker-password'  // Jenkins credential ID
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

        stage('Docker Build & Push in Parallel') {
            parallel {
                stage('Frontend Docker Build & Push') {
                    stages {
                        stage('Build Frontend Image') {
                            steps {
                                script {
                                    bat 'docker build -t pavithra0228/movieapp-frontend:%BUILD_NUMBER% ./movieapp-frontend'
                                }
                            }
                        }

                        stage('Push Frontend Image') {
                            steps {
                                withCredentials([string(credentialsId: DOCKER_CREDENTIALS, variable: 'DOCKER_PASSWORD')]) {
                                    script {
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
                                    bat 'docker build -t pavithra0228/movieapp-backend:%BUILD_NUMBER% ./movieapp-backend'
                                }
                            }
                        }

                        stage('Push Backend Image') {
                            steps {
                                withCredentials([string(credentialsId: DOCKER_CREDENTIALS, variable: 'DOCKER_PASSWORD')]) {
                                    script {
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

        stage('Deploy (Optional)') {
            steps {
                echo 'Deploying the application...'
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
