#!/bin/bash
# EC2 Setup Script for Kyron Medical
# Run this on a fresh Ubuntu 22.04 EC2 instance (t2.micro or t3.small)
# Usage: chmod +x setup-ec2.sh && ./setup-ec2.sh

echo "=== Kyron Medical EC2 Setup ==="

# 1. Update system
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (keeps app running after terminal closes)
sudo npm install -g pm2

# 4. Install Nginx (reverse proxy + HTTPS)
sudo apt-get install -y nginx

# 5. Install Certbot for free HTTPS (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "=== System setup complete ==="
