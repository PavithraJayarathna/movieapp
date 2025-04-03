provider "aws" {
  region = "us-east-1"
}

# Security Group definition
resource "aws_security_group" "devops_sg" {
  name_prefix = "devops-sg-"
  description = "Security group for DevOps application"

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP Access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Access"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "App Port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Alternative App Port"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "devops-security-group"
  }
}

# EC2 Instance definition with conditional creation
resource "aws_instance" "devops_EC2" {
  count                  = var.create_instance ? 1 : 0  # Create only if the variable is true
  ami                    = "ami-084568db4383264d4"  # Ubuntu 22.04 LTS
  instance_type          = "t2.micro"
  key_name               = "testing_1"
  vpc_security_group_ids = [aws_security_group.devops_sg.id]

  root_block_device {
    volume_size = 24
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = <<-EOF
              #!/bin/bash
              set -ex
              
              # System updates
              sudo apt update -y
              sudo apt upgrade -y

              # Docker installation
              sudo mkdir -m 0755 -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

              sudo apt update -y
              sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              # User permissions
              sudo usermod -aG docker ubuntu
              echo "ubuntu ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/ubuntu

              # Application setup
              sudo mkdir /app
              EOF

  tags = {
    Name = "MovieApp-Server"
  }

  lifecycle {
    prevent_destroy = true  # Prevent accidental destruction of the instance
  }
}

variable "create_instance" {
  description = "Flag to control instance creation"
  type        = bool
  default     = true  # Change this to `false` if you don't want to create a new instance
}

# Outputs
output "ec2_public_ip" {
  value       = aws_instance.devops_EC2[0].public_ip
  description = "Public IP address of the EC2 instance"
}

output "instance_id" {
  value       = aws_instance.devops_EC2[0].id
  description = "ID of the EC2 instance"
}
