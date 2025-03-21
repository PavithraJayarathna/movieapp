pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS = 'my-docker-password'  // Jenkins credential ID
        DOCKER_USERNAME = 'pavithra0228'  // Your Docker Hub username
        EC2_PRIVATE_KEY_PATH = 'C:\\Users\\pavit\\Downloads\\Movieappaws\\movie_app_new.pem'  // Path to your PEM key
        EC2_USER = 'ubuntu'  // EC2 user
    }

    stages {
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/PavithraJayarathna/movieapp.git'
                }
            }
        }

        stage('Terraform Init and Apply') {
            steps {
                script {
                    // Run Terraform Init and Apply to create EC2 instance
                    sh 'terraform init'
                    sh 'terraform apply -auto-approve'
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
                script {
                    // Retrieve the public IP from Terraform output
                    def ec2_public_ip = sh(script: 'terraform output -raw ec2_public_ip', returnStdout: true).trim()

                    // Copy docker-compose.yml to EC2 instance
                    sh "scp -i ${EC2_PRIVATE_KEY_PATH} docker-compose.yml ${EC2_USER}@${ec2_public_ip}:/home/ubuntu/app/"

                    // SSH to EC2 instance and run Docker Compose to start the containers
                    sh "ssh -i ${EC2_PRIVATE_KEY_PATH} ${EC2_USER}@${ec2_public_ip} 'docker-compose up -d'"
                }
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
