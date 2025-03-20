pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS = 'my-docker-password'  // Jenkins credential ID
        DOCKER_USERNAME = 'pavithra0228'  // Your Docker Hub username
        EC2_IP = 'ec2-18-212-53-48.compute-1.amazonaws.com'  // EC2 public IP
        PEM_KEY_PATH = 'C:\\Users\\pavit\\Downloads\\aws\\movie_app.pem'  // Path to your PEM key
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

        stage('Deploy to EC2') {
            steps {
                bat 'echo Deploying the application to EC2...'

                // Fixed SCP command
                bat 'powershell.exe -Command "& {scp -i \\"C:\\Users\\pavit\\Downloads\\aws\\movie_app.pem\\" C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\moveappDevop\\docker-compose.yml ubuntu@ec2-18-212-53-48.compute-1.amazonaws.com:/home/ubuntu/app/}"'

                // Fixed SSH command
                bat 'powershell.exe -Command "& {ssh -i \\"C:\\Users\\pavit\\Downloads\\aws\\movie_app.pem\\" ubuntu@ec2-18-212-53-48.compute-1.amazonaws.com \\"docker-compose up -d\\"}"'
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
