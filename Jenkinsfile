pipeline {
    agent any
    environment {
        DOCKER_REGISTRY = 'pavithra0228'
        TF_CACHE_DIR = "C:\\terraform_cache"
        ANSIBLE_USER = 'ec2-user'
        AWS_DEFAULT_REGION = 'us-east-1'
    }

    stages {
        stage('Terraform Setup') {
            steps {
                script {
                    dir('terraform') {
                        bat 'terraform init -input=false'
                        
                        // Refresh state to ensure we have up-to-date information
                        bat 'terraform refresh'

                        // Check if EC2 instance exists using Terraform output
                        def ec2InstanceId = bat(script: 'terraform output -raw instance_id', returnStdout: true).trim()

                        if (ec2InstanceId) {
                            echo "EC2 instance exists: ${ec2InstanceId}, skipping creation."
                        } else {
                            echo "No EC2 instance found, creating a new one."
                            bat 'terraform apply -auto-approve'
                        }
                    }
                }
            }
        }




        stage('Docker Build & Push') {
            steps {
                script {
                    // Build and push frontend image
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        // Login to Docker Hub
                        bat """
                            echo | set /p="${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
                            // Build and push the frontend Docker image
                            docker build -t "${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER}" ./movieapp-frontend
                            docker push "${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER}"
                        """
                    }

                    // Build and push backend image
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        // Login to Docker Hub again (can reuse or do it separately)
                        bat """
                            echo | set /p="${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
                            // Build and push the backend Docker image
                            docker build -t "${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER}" ./movieapp-backend
                            docker push "${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER}"
                            docker logout
                        """
                    }
                }
            }
        }


        stage('Ansible Deployment') {
            steps {
                script {
                    def publicIP = bat(script: 'terraform output -raw ec2_public_ip', returnStdout: true).trim()
                    
                    if (!publicIP) {
                        error "Terraform did not return a valid EC2 public IP. Check your Terraform outputs."
                    }

                    writeFile file: 'ansible/inventory.ini', text: """
                    [movieapp_servers]
                    ${publicIP}
                    
                    [movieapp_servers:vars]
                    ansible_user=ec2-user
                    ansible_ssh_private_key_file=../keys/ec2_key.pem
                    ansible_python_interpreter=/usr/bin/python3
                    docker_registry=pavithra0228
                    build_number=${BUILD_NUMBER}
                    """

                    // Run Ansible playbook to deploy Docker container on EC2
                    bat 'ansible-playbook -i ansible/inventory.ini ansible/deploy.yml'
                }
            }
        }



    }

    post {
        always {
            bat 'docker system prune -af'  // Clean Docker artifacts
            cleanWs(cleanWhenFailure: true)  // Clean workspace
        }
        success {
            // Destroy Terraform resources (if needed)
            dir('terraform') {
                bat 'terraform destroy -auto-approve'
            }
            echo "Deployment Successful: ${ec2PublicIp}"
        }
        failure {
            echo "Deployment Failed - Resources preserved for debugging"
        }
    }
}
