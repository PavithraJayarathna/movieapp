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
                        
                        // Refresh state to recognize existing resources
                        bat 'terraform refresh'
                        
                        def tfState = bat(script: 'terraform state list', returnStdout: true).trim()
                        
                        if (tfState.contains("aws_instance.devops_EC2")) {
                            echo "EC2 instance exists, skipping creation."
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
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        bat """
                            echo | set /p="${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
                            docker build -t "${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER}" ./movieapp-frontend
                            docker push "${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER}"
                            docker logout
                        """
                    }
                }
            }
        }

        stage('Ansible Setup') {
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
            build_number=123
            docker_registry=pavithra0228
            """
        }
    }
}

stage('Cleanup Docker') {
    steps {
        script {
            try {
                sh 'docker system prune -af || echo "Prune already running, skipping..."'
            } catch (Exception e) {
                echo "Docker prune failed, but continuing..."
            }
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
