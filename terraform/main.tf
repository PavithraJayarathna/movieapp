provider "aws" {
  region = "us-east-1"
}

# Fetch existing EC2 instance with tag Name=MovieEc2
data "aws_instances" "existing" {
  filter {
    name   = "tag:Name"
    values = ["MovieEc2"]
  }
}

# Security Group for MovieApp
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

# Create EC2 instance only if no existing instance is found
resource "aws_instance" "MovieEc2" {
  count = length(data.aws_instances.existing.ids) > 0 ? 0 : 1  # Skip creation if instance exists

  ami                    = "ami-071226ecf16aa7d96"
  instance_type          = "t2.micro"
  key_name               = "testing_1"
  security_groups        = [aws_security_group.movieapp_sg.name]

  lifecycle {
    ignore_changes = [ami]  # Prevents instance from recreating due to AMI changes
  }

  user_data = <<-EOF
    #!/bin/bash
    sudo apt-get update -y
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
  EOF

  tags = {
    Name = "MovieEc2"
  }
}

# Output the EC2 public IP (existing or newly created)
output "ec2_public_ip" {
  value       = length(data.aws_instances.existing.public_ips) > 0 ? data.aws_instances.existing.public_ips[0] : aws_instance.MovieEc2[0].public_ip
  description = "Public IP of the EC2 instance"
}
