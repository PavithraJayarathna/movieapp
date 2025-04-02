pipeline {
    agent any
    environment {
        PYTHON_SCRIPTS = "C:\\Users\\pavit\\AppData\\Local\\Programs\\Python\\Python312\\Scripts"
        PATH = "${env.PYTHON_SCRIPTS};${env.PATH}"
        ANSIBLE_USER = 'ec2-user'
        DOCKER_REGISTRY = 'pavithra0228'
    }
    stages {
        /* STAGE 1: Code Checkout */
        stage('SCM Checkout') {
            steps {
                git branch: 'pavinew', 
                url: 'https://github.com/PavithraJayarathna/movieapp.git'
            }
        }

        /* STAGE 2: Terraform Deployment */
        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    bat 'terraform init'
                    bat 'terraform apply -auto-approve'
                    script {
                        env.EC2_PUBLIC_IP = bat(
                            script: 'terraform output -raw ec2_public_ip', 
                            returnStdout: true
                        ).trim()
                    }
                }
            }
        }

        /* STAGE 3: Docker Build & Push */
        stage('Docker Operations') {
            environment {
                DOCKER_CREDS = credentials('docker-hub-creds')
            }
            steps {
                script {
                    bat """
                    echo %DOCKER_CREDS_PSW% | docker login -u %DOCKER_CREDS_USR% --password-stdin
                    """
                    parallel(
                        frontend: {
                            bat """
                            docker build ^
                                --build-arg REACT_APP_API_URL=http://backend:8000 ^
                                -t ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER} ^
                                ./movieapp-frontend
                            docker push ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER}
                            """
                        },
                        backend: {
                            bat """
                            docker build ^
                                --build-arg PORT=8000 ^
                                --build-arg MONGO_URI=mongodb://mongo:27017/movies ^
                                -t ${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER} ^
                                ./movieapp-backend
                            docker push ${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER}
                            """
                        }
                    )
                }
            }
        }

        /* STAGE 4: Ansible Setup */
        stage('Ansible Setup') {
            steps {
                dir('ansible') {
                    // Generate clean inventory.ini
                    script {
                        writeFile file: 'inventory.ini', text: """
                        [movieapp_servers]
                        ${env.EC2_PUBLIC_IP}

                        [movieapp_servers:vars]
                        ansible_user=${env.ANSIBLE_USER}
                        ansible_ssh_private_key_file=/root/.ssh/id_rsa
                        ansible_python_interpreter=/usr/bin/python3
                        build_number=${env.BUILD_NUMBER}
                        """
                    }
                    
                    // Handle SSH key securely
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'ec2-ssh-key',
                        keyFileVariable: 'SSH_KEY'
                    )]) {
                        bat """
                        if not exist keys mkdir keys
                        copy "${SSH_KEY}" "keys\\deploy_key.pem"
                        icacls "keys\\deploy_key.pem" /inheritance:r
                        icacls "keys\\deploy_key.pem" /grant:r "%USERNAME%":(R)
                        """
                    }
                }
            }
        }

        /* STAGE 5: Ansible Execution */
        stage('Run Ansible Playbook') {
            steps {
                dir('ansible') {
                    script {
                        // 1. Verify required files exist
                        def keyExists = fileExists 'keys/deploy_key.pem'
                        def inventoryExists = fileExists 'inventory.ini'
                        def playbookExists = fileExists 'deploy-movieapp.yml'
                        
                        if (!keyExists || !inventoryExists || !playbookExists) {
                            error("Missing required files: " +
                                "${!keyExists ? 'deploy_key.pem ' : ''}" +
                                "${!inventoryExists ? 'inventory.ini ' : ''}" +
                                "${!playbookExists ? 'deploy-movieapp.yml' : ''}")
                        }

                        // 2. Use a working Docker image with proper Ansible version
                        withCredentials([sshUserPrivateKey(
                            credentialsId: 'ec2-ssh-key',
                            keyFileVariable: 'SSH_KEY'
                        )]) {
                            bat """
                            docker run --rm ^
                                -v "%cd%:/ansible" ^
                                -w /ansible ^
                                -e ANSIBLE_HOST_KEY_CHECKING=False ^
                                ghcr.io/ansible/ansible-runner:latest ^
                                sh -c "\
                                    apk add --no-cache openssh-client && \
                                    mkdir -p /root/.ssh && \
                                    cp /ansible/keys/deploy_key.pem /root/.ssh/id_rsa && \
                                    chmod 600 /root/.ssh/id_rsa && \
                                    ansible-galaxy collection install community.docker -f && \
                                    ansible-playbook -i inventory.ini deploy-movieapp.yml -vvv"
                            """
                        }
                    }
                }
            }
        }

        /* STAGE 6: Verification */
        stage('Verify Deployment') {
            steps {
                script {
                    // Test frontend
                    bat """
                    curl -s -o nul -w "%%{http_code}" http://${env.EC2_PUBLIC_IP}:3000 | findstr "200"
                    """
                    
                    // Test backend API
                    bat """
                    curl -s -o nul -w "%%{http_code}" http://${env.EC2_PUBLIC_IP}:8000/api/movies | findstr "200"
                    """
                }
            }
        }
    }

    post {
        always {
            bat 'docker logout || echo "Already logged out"'
            cleanWs()
        }
        success {
            echo "Successfully deployed to ${env.EC2_PUBLIC_IP}"
            echo "Frontend: http://${env.EC2_PUBLIC_IP}:3000"
            echo "Backend: http://${env.EC2_PUBLIC_IP}:8000"
        }
        failure {
            echo "Pipeline failed - check logs"
            archiveArtifacts artifacts: 'ansible/**/*.log', allowEmptyArchive: true
            archiveArtifacts artifacts: 'ansible/inventory.ini', allowEmptyArchive: true
            archiveArtifacts artifacts: 'terraform/*.tfstate*', allowEmptyArchive: true
        }
    }
}