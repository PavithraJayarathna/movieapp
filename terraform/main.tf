provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "devops_EC2" {
  ami                    = "ami-084568db4383264d4"
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

output "ec2_public_ip" {
  value       = try(aws_instance.devops_EC2[0].public_ip, null)
  description = "Public IP address of the EC2 instance"
}

output "instance_id" {
  value       = try(aws_instance.devops_EC2[0].id, null)
  description = "ID of the EC2 instance"
}
