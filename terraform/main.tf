terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.94.0"  # Pinned to your exact version
    }
  }

  backend "s3" {
    bucket = "your-tf-state-bucket"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

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
  count                  = var.create_instance ? 1 : 0
  ami                    = "ami-084568db4383264d4"  # Make sure to use a valid AMI ID for your region
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
              
              sudo apt update -y
              sudo apt upgrade -y

              sudo mkdir -m 0755 -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

              sudo apt update -y
              sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              sudo usermod -aG docker ubuntu
              echo "ubuntu ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/ubuntu
              sudo mkdir /app
              EOF

  tags = {
    Name = "MovieApp-Server"
  }

  lifecycle {
    prevent_destroy = true
  }
}

variable "create_instance" {
  description = "Flag to control instance creation"
  type        = bool
  default     = true
}

# Outputs
output "ec2_public_ip" {
  value       = try(aws_instance.devops_EC2[0].public_ip, null)
  description = "Public IP address of the EC2 instance"
}

output "instance_id" {
  value       = try(aws_instance.devops_EC2[0].id, null)
  description = "ID of the EC2 instance"
}
