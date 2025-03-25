pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS = 'my-docker-password'  
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
                    sh 'terraform init'
                    sh 'terraform apply -auto-approve'
                }
            }
        }

        stage('Configure EC2 with Ansible') {
            steps {
                script {
                    def ec2_public_ip = sh(script: 'terraform output -raw ec2_public_ip', returnStdout: true).trim()
                    sh "ansible-playbook -i ${ec2_public_ip}, -u ${EC2_USER} --private-key ${EC2_PRIVATE_KEY} ansible-playbook.yml"
                }
            }
        }

        stage('Docker Build & Push in Parallel') {
            parallel {
                stage('Frontend') {
                    stages {
                        stage('Build Frontend Image') {
                            steps {
                                script {
                                    sh 'docker build -t pavithra0228/movieapp-frontend:${BUILD_NUMBER} ./movieapp-frontend'
                                }
                            }
                        }

                        stage('Push Frontend Image') {
                            steps {
                                withCredentials([string(credentialsId: DOCKER_CREDENTIALS, variable: 'DOCKER_PASSWORD')]) {
                                    script {
                                        sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin"
                                        sh 'docker push pavithra0228/movieapp-frontend:${BUILD_NUMBER}'
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
                                    sh 'docker build -t pavithra0228/movieapp-backend:${BUILD_NUMBER} ./movieapp-backend'
                                }
                            }
                        }

                        stage('Push Backend Image') {
                            steps {
                                withCredentials([string(credentialsId: DOCKER_CREDENTIALS, variable: 'DOCKER_PASSWORD')]) {
                                    script {
                                        sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin"
                                        sh 'docker push pavithra0228/movieapp-backend:${BUILD_NUMBER}'
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
                    def ec2_public_ip = sh(script: 'terraform output -raw ec2_public_ip', returnStdout: true).trim()

                    // Copy docker-compose.yml to EC2
                    sh "scp -o StrictHostKeyChecking=no -i ${EC2_PRIVATE_KEY} docker-compose.yml ${EC2_USER}@${ec2_public_ip}:/home/ubuntu/app/"

                    // SSH into EC2 and run Docker Compose
                    sh "ssh -o StrictHostKeyChecking=no -i ${EC2_PRIVATE_KEY} ${EC2_USER}@${ec2_public_ip} 'cd /home/ubuntu/app && docker-compose up -d'"
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
