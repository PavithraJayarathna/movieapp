pipeline {
    agent any

    environment {
        DOCKER_USERNAME = 'pavithra0228'
        EC2_PRIVATE_KEY = credentials('aws-ec2-key')
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

        stage('Terraform Init and Apply') {
            steps {
                script {
                    bat 'wsl sh -c "terraform init && terraform apply -auto-approve"'
                }
            }
        }

        stage('Docker Build & Push (Executed in Parallel)') {
            parallel {
                stage('Frontend') {
                    stages {
                        stage('Build Frontend Image') {
                            steps {
                                script {
                                    bat '''
                                    wsl sh -c "
                                    docker build -t pavithra0228/movieapp-frontend:${BUILD_NUMBER} ./movieapp-frontend
                                    "
                                    '''
                                }
                            }
                        }

                        stage('Push Frontend Image') {
                            steps {
                                withCredentials([string(credentialsId: 'my-docker-password', variable: 'DOCKER_PASSWORD')]) {
                                    script {
                                        bat '''
                                        wsl sh -c "
                                        echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin &&
                                        docker push pavithra0228/movieapp-frontend:${BUILD_NUMBER}
                                        "
                                        '''
                                    }
                                }
                            }
                        }
                    }
                }

                stage('Backend') {
                    stages {
                        stage('Build Backend Image') {
                            steps {
                                script {
                                    bat '''
                                    wsl sh -c "
                                    docker build -t pavithra0228/movieapp-backend:${BUILD_NUMBER} ./movieapp-backend
                                    "
                                    '''
                                }
                            }
                        }

                        stage('Push Backend Image') {
                            steps {
                                withCredentials([string(credentialsId: 'my-docker-password', variable: 'DOCKER_PASSWORD')]) {
                                    script {
                                        bat '''
                                        wsl sh -c "
                                        echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin &&
                                        docker push pavithra0228/movieapp-backend:${BUILD_NUMBER}
                                        "
                                        '''
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
                    def ec2_public_ip = bat(script: 'wsl sh -c "terraform output -raw ec2_public_ip"', returnStdout: true).trim()
                    if (!ec2_public_ip) {
                        error "EC2 instance IP not found. Terraform might have failed."
                    }

                    echo "Deploying to EC2 at ${ec2_public_ip}"

                    bat '''
                    wsl sh -c "
                    scp -o StrictHostKeyChecking=no -i ${EC2_PRIVATE_KEY} docker-compose.yml ${EC2_USER}@${ec2_public_ip}:/home/ubuntu/app/ &&
                    ssh -o StrictHostKeyChecking=no -i ${EC2_PRIVATE_KEY} ${EC2_USER}@${ec2_public_ip} 'cd /home/ubuntu/app && docker-compose up -d'
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
