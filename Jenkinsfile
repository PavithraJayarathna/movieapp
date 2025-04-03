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
                        // Initialize Terraform and apply the configuration to provision the instance
                        echo "Provisioning infrastructure with Terraform..."
                        bat 'terraform init -input=false'
                        bat 'terraform apply -auto-approve'
                    }
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    def dockerCreds = credentials('docker-hub-creds')
                    bat """
                    echo ${dockerCreds.PSW} | docker login -u ${dockerCreds.USR} --password-stdin
                    docker build -t ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER} ./movieapp-frontend
                    docker push ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER}
                    docker build -t ${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER} ./movieapp-backend
                    docker push ${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER}
                    docker logout
                    """
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
