pipeline {
    agent any

    environment {
        PYTHON_SCRIPTS = "C:\\Users\\pavit\\AppData\\Local\\Programs\\Python\\Python312\\Scripts"
        PATH = "${env.PYTHON_SCRIPTS};${env.PATH}"
        ANSIBLE_USER = 'ec2-user'
        DOCKER_REGISTRY = 'pavithra0228'
        TERRAFORM_CACHE = "C:\\terraform_cache"
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
                    // Ensure Terraform cache directory exists
                    bat 'mkdir "%TERRAFORM_CACHE%" 2>nul || echo "Cache exists"'

                    // Initialize Terraform with plugin cache
                    script {
                        def initSuccess = false
                        for (int i = 0; i < 3; i++) {
                            try {
                                bat 'terraform init -plugin-dir="%TERRAFORM_CACHE%"'
                                initSuccess = true
                                break
                            } catch (Exception e) {
                                echo "Terraform init failed, retrying... (${i + 1}/3)"
                                sleep(10)
                            }
                        }
                        if (!initSuccess) {
                            error "Terraform init failed after 3 attempts"
                        }
                    }

                    // Apply Terraform changes
                    bat 'terraform apply -auto-approve'

                    // Fetch EC2 public IP
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
                    bat "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                    
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
                    writeFile file: 'inventory.ini', text: """
                    [movieapp_servers]
                    ${env.EC2_PUBLIC_IP}

                    [movieapp_servers:vars]
                    ansible_user=${ANSIBLE_USER}
                    ansible_ssh_private_key_file=${WORKSPACE}/ansible/keys/deploy_key.pem
                    ansible_python_interpreter=/usr/bin/python3
                    build_number=${BUILD_NUMBER}
                    """

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

        /* STAGE 5: Run Ansible Playbook */
        stage('Run Ansible Playbook') {
            steps {
                script {
                    bat """
                    docker run --rm -v "%cd%:/ansible" -w /ansible alpine/ansible sh -c "
                        ansible-galaxy collection install community.docker
                        ansible-playbook -i inventory.ini deploy-movieapp.yml
                    "
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
        }
        failure {
            echo "Pipeline failed - check logs"
        }
    }
}
