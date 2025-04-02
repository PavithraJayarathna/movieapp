pipeline {
    agent any
    environment {
        // Static variables matching your Ansible config
        ANSIBLE_USER = 'ec2-user'
        DOCKER_REGISTRY = 'pavithra0228'
    }
    stages {
        /* STAGE 1: Code Checkout */
        stage('SCM Checkout') {
            steps {
                git branch: 'main', 
                url: 'https://github.com/PavithraJayarathna/newMovie.git'
            }
        }

        /* STAGE 2: Terraform Deployment */
        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    sh 'terraform init'
                    sh 'terraform apply -auto-approve'
                    script {
                        env.EC2_PUBLIC_IP = sh(
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
                    parallel(
                        frontend: {
                            sh """
                            docker build \
                                --build-arg REACT_APP_API_URL=http://backend:8000 \
                                -t ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER} \
                                ./movieapp-frontend
                            echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin
                            docker push ${DOCKER_REGISTRY}/movieapp-frontend:${BUILD_NUMBER}
                            """
                        },
                        backend: {
                            sh """
                            docker build \
                                --build-arg PORT=8000 \
                                --build-arg MONGO_URI=mongodb://mongo:27017/movies \
                                -t ${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER} \
                                ./movieapp-backend
                            echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin
                            docker push ${DOCKER_REGISTRY}/movieapp-backend:${BUILD_NUMBER}
                            """
                        }
                    )
                }
            }
        }

        /* STAGE 4: Ansible Deployment */
        stage('Ansible Setup') {
            steps {
                dir('ansible') {
                    // Generate inventory.ini exactly as specified
                    writeFile file: 'inventory.ini', text: """
                    [movieapp_servers]
                    ${env.EC2_PUBLIC_IP}

                    [movieapp_servers:vars]
                    ansible_user=${ANSIBLE_USER}
                    ansible_ssh_private_key_file=${WORKSPACE}/ansible/keys/deploy_key.pem
                    ansible_python_interpreter=/usr/bin/python3
                    build_number=${BUILD_NUMBER}
                    """
                    
                    // Handle SSH key securely
                    withCredentials([file(credentialsId: 'ec2-ssh-key', variable: 'SSH_KEY')]) {
                        sh """
                        cp ${SSH_KEY} keys/deploy_key.pem
                        chmod 400 keys/deploy_key.pem
                        """
                    }
                }
            }
        }

        /* STAGE 5: Ansible Execution */
        stage('Run Ansible Playbook') {
            steps {
                dir('ansible') {
                    sh 'ansible-galaxy collection install community.docker'
                    sh """
                    ansible-playbook \
                      -i inventory.ini \
                      deploy-movieapp.yml
                    """
                }
            }
        }
    }
    post {
        always {
            sh 'docker logout || true'
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