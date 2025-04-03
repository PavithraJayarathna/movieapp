provider "aws" {
  region = "us-east-1"
}

data "aws_instances" "existing" {
  filter {
    name   = "tag:Name"
    values = ["MovieEc2"]
  }
}

resource "aws_security_group" "movieapp_sg" {
  name_prefix = "movieapp-sg-"

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
}

resource "aws_instance" "MovieEc2" {
  count = length(data.aws_instances.existing.ids) > 0 ? 0 : 1

  ami                    = "ami-071226ecf16aa7d96"
  instance_type          = "t2.micro"
  key_name               = "testing_1"
  security_groups        = [aws_security_group.movieapp_sg.name]

  lifecycle {
    ignore_changes = [ami]
  }

  user_data = <<-EOF
    #!/bin/bash
    set -x  # Enable debugging
    exec > >(tee /var/log/user-data.log) 2>&1
    
    # Update system
    sudo yum update -y
    
    # Install Docker (Amazon Linux 2 specific)
    sudo amazon-linux-extras install docker -y
    sudo systemctl enable docker
    sudo systemctl start docker
    
    # Add ec2-user to docker group
    sudo usermod -aG docker ec2-user
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    # Install other dependencies
    sudo yum install -y git
    
    # Verify installations
    docker --version
    docker-compose --version
    
    # Reboot to apply all changes (especially usermod)
    sudo reboot
  EOF

  tags = {
    Name = "MovieEc2"
  }
}