pipeline {
    agent any
    options {
        skipDefaultCheckout true
        timeout(time: 30, unit: 'MINUTES')
    }
    environment {
        DOCKER_REGISTRY = 'pavithra0228'
        TF_CACHE_DIR = "C:\\terraform_cache"
        TF_PLUGIN_CACHE_DIR = "${TF_CACHE_DIR}\\plugin-cache"
        ANSIBLE_USER = 'ec2-user'
        AWS_DEFAULT_REGION = 'us-east-1'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [[
                        $class: 'CloneOption',
                        depth: 1,  // Shallow clone
                        timeout: 5
                    ]],
                    userRemoteConfigs: [[url: 'https://github.com/PavithraJayarathna/movieapp.git']]
                ])
            }
        }
        
        stage('Terraform Setup') {
            steps {
                dir('terraform') {
                    bat 'terraform init -input=false'
                    bat 'terraform validate'
                    
                    script {
                        def ec2InstanceId = bat(
                            script: 'terraform output -raw instance_id || echo ""',
                            returnStdout: true
                        ).trim()
                        
                        if (ec2InstanceId) {
                            echo "EC2 instance exists: ${ec2InstanceId}"
                        } else {
                            bat 'terraform apply -auto-approve'
                        }
                    }
                }
            }
        }
        
        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    bat """
                        echo | set /p="${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
                    """
                    
                    script {
                        def builds = [
                            'frontend': './movieapp-frontend',
                            'backend': './movieapp-backend'
                        ]
                        
                        builds.each { name, path ->
                            bat """
                                docker build -t "${DOCKER_REGISTRY}/movieapp-${name}:${BUILD_NUMBER}" ${path}
                                docker push "${DOCKER_REGISTRY}/movieapp-${name}:${BUILD_NUMBER}"
                            """
                        }
                        
                        bat 'docker logout'
                    }
                }
            }
        }
        
        stage('Ansible Deployment') {
            steps {
                script {
                    def publicIP = bat(
                        script: 'terraform output -raw ec2_public_ip',
                        returnStdout: true
                    ).trim()
                    
                    writeFile file: 'ansible/inventory.ini', text: """
                    [movieapp_servers]
                    ${publicIP}
                    
                    [movieapp_servers:vars]
                    ansible_user=ubuntu
                    ansible_ssh_private_key_file=/mnt/c/Users/pavit/.ssh/ec2_key.pem
                    ansible_python_interpreter=/usr/bin/python3
                    docker_registry=${DOCKER_REGISTRY}
                    build_number=${BUILD_NUMBER}
                    """
                    
                    bat 'wsl ansible-playbook -i ansible/inventory.ini ansible/deploy-movieapp.yml'
                }
            }
        }
    }
    
    post {
        always {
            script {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'docker system prune -af'
                }
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    deleteDir()  // More reliable than cleanWs
                }
            }
        }
        success {
            dir('terraform') {
                bat 'terraform destroy -auto-approve'
            }
        }
    }
}