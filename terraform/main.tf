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
    sudo yum update -y

    # Install Docker
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user

    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

    # Install Git & other tools
    sudo yum install -y git unzip

    # Pull MovieApp repo (Replace with your repo)
    git clone https://github.com/yourusername/movieapp.git /home/ec2-user/movieapp
    cd /home/ec2-user/movieapp

    # Pre-download Docker images (for faster deployment)
    sudo docker pull pavithra0228/movieapp-frontend:latest
    sudo docker pull pavithra0228/movieapp-backend:latest
  EOF

  tags = {
    Name = "MovieEc2"
  }
}

output "ec2_public_ip" {
  value       = length(data.aws_instances.existing.public_ips) > 0 ? data.aws_instances.existing.public_ips[0] : aws_instance.MovieEc2[0].public_ip
  description = "Public IP of the EC2 instance"
}
