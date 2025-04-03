pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        DOCKERHUB_CREDS       = credentials('DOCKERHUB_CREDS')
    }

    stages {
        stage('Terraform Init & Apply') {
            steps {
                dir('terraform') {
                    script {
                        try {
                            bat 'terraform init -input=false'
                            bat 'terraform apply -auto-approve'
                        } catch(e) {
                            error "Terraform stage failed: ${e}"
                        }
                    }
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                dir('docker') {
                    script {
                        docker.build("pavithra0228/movieapp:${env.BUILD_ID}").push()
                    }
                }
            }
        }

        stage('Ansible Deploy') {
            steps {
                dir('ansible') {
                    script {
                        bat 'ansible-playbook -i inventory.ini deploy.yml'
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Clean up Terraform processes
                bat 'taskkill /F /IM terraform.exe /T 2> nul || exit 0'
                
                // Clean up workspace
                cleanWs(
                    cleanWhenFailure: true,
                    deleteDirs: true,
                    patterns: [[pattern: '**', type: 'INCLUDE']]
                )
            }
        }
    }
}