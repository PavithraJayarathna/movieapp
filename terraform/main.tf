provider "aws" {
  region = "us-east-1"
}

resource "aws_security_group" "devops_sg" {
  name_prefix = "devops-sg-"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "devops_EC2" {
  ami                    = "ami-084568db4383264d4"
  instance_type          = "t2.micro"
  key_name               = "devops-project"
  security_groups        = [aws_security_group.devops_sg.name]

  root_block_device {
    volume_size = 24
    volume_type = "gp3"
  }

  lifecycle {
    ignore_changes = [ami]
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e
              
              echo "Updating system..."
              sudo apt update -y
              sudo apt install -y ca-certificates curl gnupg

              echo "Adding Docker GPG key..."
              sudo install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null
              sudo chmod a+r /etc/apt/keyrings/docker.asc

              echo "Adding Docker repository..."
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
              $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

              sudo apt update -y

              echo "Installing Docker..."
              sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              echo "Starting Docker service..."
              sudo systemctl start docker
              sudo systemctl enable docker

              echo "Adding user to Docker group..."
              sudo usermod -aG docker ubuntu

              echo "Allowing SSH login for ubuntu user..."
              echo "ubuntu ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/ubuntu

              echo "Docker installation completed successfully."
              EOF

  tags = {
    Name = "EC2_Instance"
  }
}

output "ec2_public_ip" {
  value       = aws_instance.devops_EC2.public_ip
  description = "Public IP of the EC2 instance"
}
