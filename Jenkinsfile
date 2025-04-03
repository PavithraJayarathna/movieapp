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
                // Check if EC2 instance exists in the Terraform state
                def instanceExists = bat(script: 'terraform state list aws_instance.devops_EC2', returnStdout: true).trim()

                // Debug output
                echo "Terraform state returned: '${instanceExists}'"

                // Check if the instance exists in the state
                if (instanceExists) {
                    echo "EC2 instance 'DevOpsEC2' already exists in the Terraform state. Skipping Terraform creation."
                } else {
                    echo "No existing EC2 instance found. Provisioning new instance with Terraform."
                    // Initialize Terraform
                    bat 'terraform init'
                    // Apply Terraform configuration to create the EC2 instance
                    bat 'terraform apply -auto-approve'
                }
            }
        }
    }
}




        stage('Docker Build & Push') {
            steps {
                script {
                    // Using withCredentials to securely handle Docker credentials
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        // Log in to Docker Hub using the credentials
                        echo "Logging into Docker Hub with username: ${DOCKER_USERNAME}"

                        bat """
                        echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin
                        docker build -t ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER} ./movieapp-frontend
                        docker push ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER}
                        docker logout
                        """
                    }
                }
            }
        }
    


        stage('Ansible Deploy') {
            steps {
                script {
                    // Retrieve the public IP of the instance created by Terraform
                    def ec2PublicIp = sh(script: 'terraform output -raw ec2_public_ip', returnStdout: true).trim()
                    echo "EC2 Public IP: ${ec2PublicIp}"

                    // Prepare the Ansible inventory file
                    def inventoryContent = """
                    [movieapp_servers]
                    ${ec2PublicIp}

                    [movieapp_servers:vars]
                    ansible_user=${ANSIBLE_USER}
                    ansible_ssh_private_key_file=./keys/deploy_key.pem
                    ansible_python_interpreter=/usr/bin/python3
                    build_number=${BUILD_NUMBER}
                    docker_registry=${DOCKER_REGISTRY}
                    """
                    writeFile file: 'ansible/inventory.ini', text: inventoryContent

                    // Copy SSH key securely for Ansible deployment
                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                        bat """
                        if not exist keys mkdir keys
                        copy /Y "%SSH_KEY%" "keys\\deploy_key.pem"
                        icacls "keys\\deploy_key.pem" /inheritance:r /grant:r "%USERNAME%":(R)
                        """
                    }

                    // Run the Ansible playbook
                    bat """
                    docker run --rm -v "%CD%:/ansible" -w /ansible \
                    -e ANSIBLE_HOST_KEY_CHECKING=False \
                    alpine/ansible ansible-playbook -i inventory.ini -vv deploy-movieapp.yml
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()  // Clean workspace after each build
            dir('terraform') {
                bat 'terraform destroy -auto-approve'  // Clean up Terraform resources
            }
        }
        success {
            echo "Deployment Successful: ${env.EC2_PUBLIC_IP}"
        }
        failure {
            echo "Deployment Failed"
        }
    }
}
