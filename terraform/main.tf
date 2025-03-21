provider "aws" {
  region = "us-east-1"  # US East (N. Virginia)
}

# Create an EC2 instance
resource "aws_instance" "movieapp" {
  ami                    = "ami-04b4f1a9cf54c11d0"  
  instance_type          = "t2.micro"  
  key_name               = "movie_app_new"  
  security_groups        = ["default"]  

  tags = {
    Name = "movieapp api"  
  }
}

# Output the EC2 public IP
output "ec2_public_ip" {
  value = aws_instance.movieapp.public_ip  
}
