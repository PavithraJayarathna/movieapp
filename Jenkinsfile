pipeline {
    agent any

    environment {
        // These will be injected by Jenkins from the credentials store
        EC2_PRIVATE_KEY = credentials('aws-ec2-key') // AWS EC2 private key
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
                            // Logging to debug Terraform execution
                            echo "Starting Terraform Init & Apply"
                            // Running Terraform init and apply using Git Bash
                            bat '"C:\\Program Files\\Git\\bin\\bash.exe" -c "cd terraform && terraform init && terraform apply -parallelism=10 -auto-approve"'
                        }
                    }
                }

                stage('Docker Login') {
                    steps {
                        withCredentials([usernamePassword(credentialsId: 'new-credential', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            script {
                                echo "DOCKER_USERNAME: ${DOCKER_USERNAME}" // Debugging only!
                                echo "DOCKER_PASSWORD: ********" // Masked password

                                // Docker login in non-interactive mode inside Git Bash
                                bat '''
                                echo $DOCKER_PASSWORD | "C:\\Program Files\\Git\\bin\\bash.exe" -c "docker login -u $DOCKER_USERNAME --password-stdin"
                                '''
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
                            // Running frontend Docker build & push using Git Bash
                            bat '''
                            "C:\\Program Files\\Git\\bin\\bash.exe" -c "
                            docker build --cache-from=pavithra0228/movieapp-frontend:latest -t pavithra0228/movieapp-frontend:${BUILD_NUMBER} ./movieapp-frontend &&
                            docker push pavithra0228/movieapp-frontend:${BUILD_NUMBER}
                            "
                            '''
                        }
                    }
                }

                stage('Build & Push Backend') {
                    steps {
                        script {
                            // Running backend Docker build & push using Git Bash
                            bat '''
                            "C:\\Program Files\\Git\\bin\\bash.exe" -c "
                            docker build --cache-from=pavithra0228/movieapp-backend:latest -t pavithra0228/movieapp-backend:${BUILD_NUMBER} ./movieapp-backend &&
                            docker push pavithra0228/movieapp-backend:${BUILD_NUMBER}
                            "
                            '''
                        }
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    // Get EC2 IP and deploy using Git Bash
                    def ec2_public_ip = bat(script: '"C:\\Program Files\\Git\\bin\\bash.exe" -c "terraform output -raw ec2_public_ip"', returnStdout: true).trim()
                    if (!ec2_public_ip) {
                        error "EC2 instance IP not found. Terraform might have failed."
                    }

                    echo "Deploying to EC2 at ${ec2_public_ip}"

                    // SSH and deploy Docker Compose on EC2 instance using Git Bash
                    bat '''
                    "C:\\Program Files\\Git\\bin\\bash.exe" -c "
                    ssh -o StrictHostKeyChecking=no -i ${EC2_PRIVATE_KEY} ${EC2_USER}@${ec2_public_ip} '
                    docker-compose pull &&
                    docker-compose up -d --force-recreate
                    '
                    "
                    '''
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
