provider "aws" {
  region = "us-east-1"
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
}

resource "aws_instance" "MovieEc2" {
  ami                    = "ami-071226ecf16aa7d96"
  instance_type          = "t2.micro"
  key_name               = "my_new_ppk_file"
  security_groups        = [aws_security_group.movieapp_sg.name]

  lifecycle {
    ignore_changes = [ami]  # Prevents instance from recreating due to AMI changes
  }

  user_data = <<-EOF
              #!/bin/bash
              sudo apt update -y
              sudo apt install docker docker-compose -y
              sudo systemctl start docker
              sudo systemctl enable docker
              EOF

  tags = {
    Name = "MovieEc2"
  }
}

output "ec2_public_ip" {
  value       = aws_instance.MovieEc2.public_ip
  description = "Public IP of the EC2 instance"
}