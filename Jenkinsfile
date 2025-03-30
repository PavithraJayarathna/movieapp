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
                            bat 'wsl sh -c "terraform init && terraform apply -parallelism=10 -auto-approve"'
                        }
                    }
                }

                stage('Docker Login') {
                    steps {
                        // Use the Jenkins credentials to inject DOCKER_USERNAME and DOCKER_PASSWORD
                        withCredentials([usernamePassword(credentialsId: 'my-docker-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            script {
                                // Login to Docker using the credentials injected by Jenkins
                                bat '''
                                wsl sh -c "
                                echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin
                                "
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
                            bat '''
                            wsl sh -c "
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
                            bat '''
                            wsl sh -c "
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
                    def ec2_public_ip = bat(script: 'wsl sh -c "terraform output -raw ec2_public_ip"', returnStdout: true).trim()
                    if (!ec2_public_ip) {
                        error "EC2 instance IP not found. Terraform might have failed."
                    }

                    echo "Deploying to EC2 at ${ec2_public_ip}"

                    bat '''
                    wsl sh -c "
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
