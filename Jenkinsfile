pipeline {
    agent any

    environment {
        EC2_PRIVATE_KEY = credentials('aws-ec2-key')  // AWS EC2 private key
        EC2_USER = 'ubuntu'
    }

    stages {
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/PavithraJayarathna/movieapp.git'
                }
            }
        }

        stage('Infrastructure Setup (Parallel)') {
            parallel {
                stage('Terraform Init & Apply') {
                    steps {
                        script {
                            echo "Starting Terraform Init & Apply"
                            bat '''
                            cd terraform
                            terraform init
                            terraform apply -parallelism=10 -auto-approve
                            '''
                        }
                    }
                }

                stage('Docker Login') {
                    steps {
                        withCredentials([usernamePassword(credentialsId: 'new-credential', usernameVariable: 'pavithra0228', passwordVariable: 'Jayarathna#28')]) {
                            script {
                                echo "Logging into Docker Hub"
                                bat "docker login -u %pavithra0228% -p %Jayarathna#28%"
                            }
                        }
                    }
                }
            }
        }

        stage('Docker Build & Push (Parallel)') {
            parallel {
                stage('Build & Push Frontend') {
                    steps {
                        script {
                            bat '''
                            docker build --cache-from=pavithra0228/movieapp-frontend:latest -t pavithra0228/movieapp-frontend:%BUILD_NUMBER% ./movieapp-frontend
                            docker push pavithra0228/movieapp-frontend:%BUILD_NUMBER%
                            '''
                        }
                    }
                }

                stage('Build & Push Backend') {
                    steps {
                        script {
                            bat '''
                            docker build --cache-from=pavithra0228/movieapp-backend:latest -t pavithra0228/movieapp-backend:%BUILD_NUMBER% ./movieapp-backend
                            docker push pavithra0228/movieapp-backend:%BUILD_NUMBER%
                            '''
                        }
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    // Get EC2 Public IP from Terraform Output
                    def ec2_public_ip = bat(script: 'terraform output -raw ec2_public_ip', returnStdout: true).trim()
                    if (!ec2_public_ip) {
                        error "EC2 instance IP not found. Terraform might have failed."
                    }

                    echo "Deploying to EC2 at ${ec2_public_ip}"

                    // Deploy Docker Compose on EC2 using Windows SSH
                    bat """
                    echo Deploying to EC2...
                    echo y | plink -i %EC2_PRIVATE_KEY% %EC2_USER%@${ec2_public_ip} ^
                    "docker-compose pull && docker-compose up -d --force-recreate"
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check logs for errors.'
        }
    }
}
