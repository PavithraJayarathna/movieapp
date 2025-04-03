pipeline {
    agent any
    environment {
        PYTHON_SCRIPTS = "C:\\Users\\pavit\\AppData\\Local\\Programs\\Python\\Python312\\Scripts"
        PATH = "${env.PYTHON_SCRIPTS};${env.PATH}"
        ANSIBLE_USER = 'ec2-user'
        DOCKER_REGISTRY = 'pavithra0228'
        TF_CACHE_DIR = "C:\\terraform_cache"
    }
    stages {
        /* STAGE 2: Terraform Deployment */
        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    // Initialize Terraform with cache directory
                    bat """
                    if not exist "${TF_CACHE_DIR}" mkdir "${TF_CACHE_DIR}"
                    set TF_PLUGIN_CACHE_DIR=${TF_CACHE_DIR}
                    terraform init -input=false
                    terraform validate
                    terraform plan -out=tfplan -input=false
                    terraform apply -input=false -auto-approve tfplan
                    """
                    // Get EC2 public IP output
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

        /* STAGE 3: Docker Build & Push */
        stage('Docker Operations') {
            environment {
                DOCKER_CREDS = credentials('docker-hub-creds')
            }
            steps {
                script {
                    // Test Docker connection first
                    bat 'docker version || echo "Docker not available"'
                    
                    // Login to Docker Hub
                    bat """
                    echo %DOCKER_CREDS_PSW% | docker login -u %DOCKER_CREDS_USR% --password-stdin
                    """
                    
                    // Build and push with error handling
                    try {
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
                    } catch (Exception e) {
                        echo "Docker operation failed: ${e}"
                        bat 'docker ps -a' // Debug info
                        error("Docker build/push failed")
                    }
                }
            }
        }

        /* STAGE 4: Ansible Setup */
        stage('Ansible Setup') {
            steps {
                dir('ansible') {
                    // Generate inventory.ini with proper formatting
                    writeFile file: 'inventory.ini', text: """
                    [movieapp_servers]
                    ${env.EC2_PUBLIC_IP}

                    [movieapp_servers:vars]
                    ansible_user=${env.ANSIBLE_USER}
                    ansible_ssh_private_key_file=${WORKSPACE}/ansible/keys/deploy_key.pem
                    ansible_python_interpreter=/usr/bin/python3
                    build_number=${env.BUILD_NUMBER}
                    docker_registry=${env.DOCKER_REGISTRY}
                    """
                    
                    // Handle SSH key securely with proper permissions
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'ec2-ssh-key',
                        keyFileVariable: 'SSH_KEY'
                    )]) {
                        bat """
                        if not exist keys mkdir keys
                        copy /Y "${SSH_KEY}" "keys\\deploy_key.pem"
                        icacls "keys\\deploy_key.pem" /inheritance:r /grant:r "%USERNAME%":(R)
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
                        // Use full path for Windows compatibility
                        def workspacePath = pwd().replace('\\', '/')
                        
                        bat """
                        docker run --rm \
                            -v "${workspacePath}:/ansible" \
                            -w /ansible \
                            -e ANSIBLE_HOST_KEY_CHECKING=False \
                            alpine/ansible sh -c "
                                apk add --no-cache py3-pip && \
                                pip install --no-cache-dir boto3 && \
                                ansible-galaxy collection install community.docker && \
                                ansible-playbook -i inventory.ini -vv deploy-movieapp.yml
                        "
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            bat 'docker logout'
            cleanWs()
        }
        success {
            echo "Successfully deployed to ${env.EC2_PUBLIC_IP}"
            slackSend color: 'good', message: "Pipeline SUCCESS: MovieApp deployed to ${env.EC2_PUBLIC_IP}"
        }
        failure {
            echo "Pipeline failed - check logs"
            slackSend color: 'danger', message: "Pipeline FAILED: MovieApp deployment"
        }
        unstable {
            echo "Pipeline unstable"
        }
    }
}