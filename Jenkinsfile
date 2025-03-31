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
                        withCredentials([usernamePassword(credentialsId: 'new-credential', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            echo "Docker Username: ${DOCKER_USERNAME}"
                            echo "Docker Password: ${DOCKER_PASSWORD}"
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

                    def ec2_user = 'ubuntu'

                    // Securely fetch the private key from Jenkins credentials
                    withCredentials([file(credentialsId: '72301343-8d2b-445b-b485-c377466ca495', variable: 'EC2_PRIVATE_KEY_PATH')]) {
    bat """
    echo Deploying to EC2...

    REM Install necessary dependencies for Docker Compose
    echo y | "C:\\Program Files\\PuTTY\\plink.exe" -i "%EC2_PRIVATE_KEY_PATH%" ec2-user@44.201.241.191 ^
    "sudo yum install -y libcrypt python3 && sudo ln -s /usr/bin/python3 /usr/bin/python"
    
    REM Now install Docker Compose if not already installed
    echo y | "C:\\Program Files\\PuTTY\\plink.exe" -i "%EC2_PRIVATE_KEY_PATH%" ec2-user@44.201.241.191 ^
    "sudo curl -L \"https://github.com/docker/compose/releases/download/1.29.2/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose && docker-compose --version"

    REM Now run Docker Compose commands on the EC2 instance
    echo y | "C:\\Program Files\\PuTTY\\plink.exe" -i "%EC2_PRIVATE_KEY_PATH%" ec2-user@44.201.241.191 ^
    "docker-compose pull && docker-compose up -d --force-recreate"
    """
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
