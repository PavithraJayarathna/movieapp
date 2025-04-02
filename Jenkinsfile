pipeline {
    agent any
    environment {
        ANSIBLE_USER = 'ec2-user'
        DOCKER_REGISTRY = 'pavithra0228'
    }
    stages {
        stage('SCM Checkout') {
            steps {
                git branch: 'pavinew', 
                url: 'https://github.com/PavithraJayarathna/movieapp.git'
            }
        }

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

        stage('Docker Operations') {
            environment {
                DOCKER_CREDS = credentials('docker-hub-creds')
            }
            steps {
                script {
                    // First authenticate with Docker Hub
                    bat """
                    docker login -u ${DOCKER_CREDS_USR} -p ${DOCKER_CREDS_PSW}
                    """
                    
                    // Then run builds and pushes
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
                    
                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
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

        stage('Run Ansible Playbook') {
            steps {
                dir('ansible') {
                    bat 'ansible-galaxy collection install community.docker'
                    bat """
                    ansible-playbook ^
                      -i inventory.ini ^
                      deploy-movieapp.yml
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