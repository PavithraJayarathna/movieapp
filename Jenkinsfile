pipeline {
    agent any

    environment {
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
                            sh '''
                            cd terraform
                            terraform init
                            terraform apply -parallelism=10 -auto-approve
                            '''
                        }
                    }
                }

                stage('Docker Login') {
                    steps {
                        withCredentials([usernamePassword(credentialsId: 'new-credential', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            sh '''
                            echo "Logging into Docker..."
                            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                            '''
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
                            sh '''
                            docker build --cache-from=pavithra0228/movieapp-frontend:latest -t pavithra0228/movieapp-frontend:$BUILD_NUMBER ./movieapp-frontend
                            docker push pavithra0228/movieapp-frontend:$BUILD_NUMBER
                            '''
                        }
                    }
                }

                stage('Build & Push Backend') {
                    steps {
                        script {
                            sh '''
                            docker build --cache-from=pavithra0228/movieapp-backend:latest -t pavithra0228/movieapp-backend:$BUILD_NUMBER ./movieapp-backend
                            docker push pavithra0228/movieapp-backend:$BUILD_NUMBER
                            '''
                        }
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    def ec2_public_ip = sh(script: 'terraform output -raw ec2_public_ip', returnStdout: true).trim()
                    if (!ec2_public_ip) {
                        error "EC2 instance IP not found. Terraform might have failed."
                    }

                    echo "Deploying to EC2 at ${ec2_public_ip}"

                    // Securely fetch the private key from Jenkins credentials
                    withCredentials([file(credentialsId: '72301343-8d2b-445b-b485-c377466ca495', variable: 'EC2_PRIVATE_KEY_PATH')]) {
                        sh '''
                        echo "Deploying to EC2..."
                        chmod 400 $EC2_PRIVATE_KEY_PATH  # Ensure correct permissions
                        ssh -o StrictHostKeyChecking=no -i $EC2_PRIVATE_KEY_PATH ubuntu@${ec2_public_ip} '
                        docker-compose pull &&
                        docker-compose up -d --force-recreate
                        '
                        '''
                    }
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
