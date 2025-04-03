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
                        // Set Terraform cache directory for Windows compatibility
                        bat """
                            echo plugin_cache_dir = "${TF_CACHE_DIR.replace('\\', '/')}" > %USERPROFILE%\\.terraformrc
                            set TERRAFORM_CONFIG=%USERPROFILE%\\.terraformrc
                        """
                        
                        // Initialize Terraform
                        bat 'terraform init -input=false'
                        
                        // Check if the EC2 instance already exists
                        def tfState = bat(
                            script: 'terraform state list',
                            returnStdout: true
                        ).trim()
                        
                        if (tfState.contains("aws_instance.devops_EC2")) {
                            echo "EC2 instance exists, skipping creation."
                            bat 'terraform refresh'  // Refresh state if the instance exists
                        } else {
                            echo "No EC2 instance found, creating a new one."
                            bat 'terraform apply -auto-approve'  // Provision new instance
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

        stage('Ansible Deploy') {
            steps {
                script {
                    // Fetch EC2 public IP from Terraform output
                    def ec2PublicIp = bat(
                        script: 'terraform output -raw ec2_public_ip',
                        returnStdout: true
                    ).trim()
                    
                    // Generate Ansible inventory dynamically
                    bat """
                        echo [movieapp_servers] > ansible\\inventory.ini
                        echo ${ec2PublicIp} >> ansible\\inventory.ini
                        echo. >> ansible\\inventory.ini
                        echo [movieapp_servers:vars] >> ansible\\inventory.ini
                        echo ansible_user=${ANSIBLE_USER} >> ansible\\inventory.ini
                        echo ansible_ssh_private_key_file=..\\keys\\ec2_key.pem >> ansible\\inventory.ini
                        echo ansible_python_interpreter=/usr/bin/python3 >> ansible\\inventory.ini
                        echo build_number=${BUILD_NUMBER} >> ansible\\inventory.ini
                        echo docker_registry=${DOCKER_REGISTRY} >> ansible\\inventory.ini
                    """

                    // Copy the SSH private key for Ansible use
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'ec2-ssh-key',
                        keyFileVariable: 'SSH_KEY'
                    )]) {
                        bat """
                            if not exist keys mkdir keys
                            copy /Y "${SSH_KEY}" "keys\\ec2_key.pem"
                            icacls "keys\\ec2_key.pem" /inheritance:r /grant:r "%USERNAME%":(R)
                        """
                    }

                    // Run Ansible Playbook for deployment
                    bat """
                        docker run --rm -v "%CD%\\ansible:/ansible" -w /ansible ^
                            -e ANSIBLE_HOST_KEY_CHECKING=False ^
                            alpine/ansible ^
                            ansible-playbook -i inventory.ini -vv deploy-movieapp.yml
                    """
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
