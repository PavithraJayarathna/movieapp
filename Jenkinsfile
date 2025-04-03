pipeline {
    agent any
    environment {
        DOCKER_REGISTRY = 'pavithra0228'
        TF_CACHE_DIR = "C:\\terraform_cache"
        ANSIBLE_USER = 'ec2-user'
        ANSIBLE_SSH_PRIVATE_KEY_PATH = ".\\ansible\\keys\\deploy_key.pem"
    }
    
    stages {
        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    bat """
                    if not exist "${TF_CACHE_DIR}" mkdir "${TF_CACHE_DIR}"
                    set TF_PLUGIN_CACHE_DIR=${TF_CACHE_DIR}
                    terraform init -input=false
                    terraform validate
                    terraform plan -out=tfplan -input=false
                    terraform apply -input=false -auto-approve tfplan
                    """
                    
                    script {
                        env.EC2_PUBLIC_IP = bat(
                            script: 'terraform output -raw ec2_public_ip',
                            returnStdout: true
                        ).trim()
                        echo "EC2 Public IP: ${env.EC2_PUBLIC_IP}"
                    }
                }
            }
        }

        stage('Docker Build & Push') {
            environment {
                DOCKER_CREDS = credentials('docker-hub-creds')
            }
            steps {
                bat """
                echo %DOCKER_CREDS_PSW% | docker login -u %DOCKER_CREDS_USR% --password-stdin
                docker build -t ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER} ./movieapp-frontend
                docker push ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER}
                docker build -t ${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER} ./movieapp-backend
                docker push ${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER}
                docker logout
                """
            }
        }
        
        stage('Ansible Setup & Deploy') {
            steps {
                dir('ansible') {
                    // Create inventory file
                    writeFile file: 'inventory.ini', text: """
                    [movieapp_servers]
                    ${env.EC2_PUBLIC_IP}

                    [movieapp_servers:vars]
                    ansible_user=${env.ANSIBLE_USER}
                    ansible_ssh_private_key_file=/ansible/keys/deploy_key.pem
                    ansible_python_interpreter=/usr/bin/python3
                    build_number=${env.BUILD_NUMBER}
                    docker_registry=${env.DOCKER_REGISTRY}
                    """
                    
                    // Handle SSH key
                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                        bat """
                        if not exist keys mkdir keys
                        copy /Y "%SSH_KEY%" "keys\\deploy_key.pem"
                        icacls "keys\\deploy_key.pem" /inheritance:r /grant:r "%USERNAME%":(R)
                        """
                    }
                    
                    // Run Ansible playbook
                    bat """
                    docker run --rm -v "${pwd().replace('\\', '/')}:/ansible" \
                    -v "C:\\ProgramData\\Jenkins\\.ssh:/root/.ssh" \
                    -w /ansible -e ANSIBLE_HOST_KEY_CHECKING=False \
                    alpine/ansible sh -c "ansible-playbook -vv deploy-movieapp.yml"
                    """
                }
            }
        }
    }
    
    post {
        always { 
            cleanWs() 
            dir('terraform') {
                bat "terraform destroy -auto-approve"  // Optional: Cleanup resources
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