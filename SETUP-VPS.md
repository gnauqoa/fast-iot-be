# VPS Setup Guide with SSL (Nginx)

This guide will walk you through setting up a complete Node.js application on a VPS with SSL encryption using Nginx as a reverse proxy. The setup supports both domain-based and IP-based SSL configurations.

## Prerequisites

- Ubuntu VPS (20.04 LTS or later recommended)
- Root or sudo access
- Domain name (optional, for domain-based SSL)
- Basic knowledge of Linux command line

## Table of Contents

1. [Initial VPS Setup](#initial-vps-setup)
2. [SSL Setup - Option A: With Domain Name](#ssl-setup---option-a-with-domain-name)
3. [SSL Setup - Option B: With IP Address](#ssl-setup---option-b-with-ip-address)
4. [Application Deployment](#application-deployment)
5. [Firewall Configuration](#firewall-configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## Initial VPS Setup

### Step 1: Update System and Install Dependencies

```bash
# Update package lists
sudo apt update

# Install Fish shell (optional but recommended)
sudo apt install fish -y
```

### Step 2: Install Docker

Docker will be used to containerize your application:

```bash
# Install required packages for Docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

# Update package cache
apt-cache policy docker-ce

# Install Docker
sudo apt install docker-ce

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker installation
docker --version
```

### Step 3: Setup SSH Key for GitHub (Optional)

If you need to clone private repositories:

```bash
# Generate SSH key (replace with your email)
ssh-keygen -t rsa -b 4096 -C "your-email@gmail.com"

# Display public key to add to GitHub
cd ~/.ssh
cat id_rsa.pub
```

Copy the output and add it to your GitHub SSH keys in Settings > SSH and GPG keys.

## SSL Setup - Option A: With Domain Name

Choose this option if you have a domain name pointing to your VPS.

### Step 1: Install Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

### Step 2: Install Certbot for Let's Encrypt SSL

```bash
# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y

# Verify Certbot installation
certbot --version
```

### Step 3: Obtain SSL Certificate

Replace `DOMAIN_NAME` with your actual domain:

```bash
# Obtain SSL certificate for your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify certificates
sudo certbot certificates
```

### Step 4: Configure Nginx for Domain

Create the Nginx configuration file:

```bash
sudo vim /etc/nginx/sites-available/default
```

Replace the contents with the domain configuration:

```nginx
# HTTP server: Redirects HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Allow ACME challenges for Let's Encrypt
    location /.well-known/acme-challenge/ {
        allow all;
        root /var/www/html;
    }

    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificate paths
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Proxy to backend on localhost:3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security header
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

## SSL Setup - Option B: With IP Address

Choose this option if you don't have a domain name and want to use your VPS IP address.

### Step 1: Install Nginx and OpenSSL

```bash
# Install Nginx and OpenSSL
sudo apt install nginx openssl -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

### Step 2: Create Self-Signed SSL Certificate

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate self-signed certificate (replace IP_ADDRESS with your VPS IP)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=YOUR_VPS_IP"

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/selfsigned.*
```

**Alternative method using automatic IP detection:**

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl

# Generate certificate with auto-detected IP
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout selfsigned.key \
  -out selfsigned.crt \
  -subj "/C=VN/ST=HCM/L=HCM/O=QuangDev/OU=Dev/CN=$(curl -s ifconfig.me)"
```

### Step 3: Configure Nginx for IP Address

```bash
sudo vim /etc/nginx/sites-available/default
```

Replace the contents with the IP configuration:

```nginx
# HTTP server: Redirects HTTP to HTTPS
server {
    listen 80;
    server_name YOUR_VPS_IP;

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    server_name YOUR_VPS_IP;

    # Self-signed SSL certificate
    ssl_certificate /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;

    # SSL settings for security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH;

    # Proxy to backend on localhost:3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security header
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

## Final Steps (Both Options)

### Step 1: Test and Reload Nginx

```bash
# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

## Application Deployment

### Step 1: Clone and Setup Application

```bash
# Clone your repository
git clone https://github.com/gnauqoa/motorbike-rescue-backend
cd motorbike-rescue-backend

# Copy environment file
cp env.docker.example .env
```

### Step 2: Start the Application

If you are using ARM chip

```bash
cp ./docker-compose.arm.yaml ./docker-compose.yaml
```

```bash
# Start all services with Docker Compose
docker-compose up --build -d

# Check if containers are running
docker-compose ps
```

## Firewall Configuration

Configure UFW (Uncomplicated Firewall) to secure your VPS:

```bash
# Allow SSH (important: do this first!)
sudo ufw allow OpenSSH

# Allow HTTP traffic
sudo ufw allow 80

# Allow HTTPS traffic
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status
```

## Verification

### Test Your Setup

1. **Check Nginx status:**
   ```bash
   sudo systemctl status nginx
   ```

2. **Check application containers:**
   ```bash
   docker-compose logs
   ```

3. **Test HTTP to HTTPS redirect:**
   ```bash
   curl -I http://your-domain-or-ip
   ```

4. **Test HTTPS connection:**
   ```bash
   curl -I https://your-domain-or-ip
   ```

5. **Access your application:**
   - Domain: `https://yourdomain.com`
   - IP: `https://your-vps-ip`

## Troubleshooting

### Common Issues

1. **Nginx fails to start:**
   ```bash
   # Check Nginx error log
   sudo tail -f /var/log/nginx/error.log
   ```

2. **SSL certificate issues:**
   ```bash
   # For Let's Encrypt certificates
   sudo certbot certificates
   
   # For self-signed certificates
   sudo ls -la /etc/nginx/ssl/
   ```

3. **Application not accessible:**
   ```bash
   # Check if application is running on port 3000
   sudo netstat -tlnp | grep :3000
   
   # Check Docker containers
   docker-compose ps
   docker-compose logs
   ```

4. **Firewall blocking connections:**
   ```bash
   # Check UFW status
   sudo ufw status verbose
   
   # Temporarily disable UFW for testing
   sudo ufw disable
   ```

### Certificate Renewal (Let's Encrypt only)

Let's Encrypt certificates auto-renew, but you can test renewal:

```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Manual renewal if needed
sudo certbot renew
```

## Security Notes

- **Self-signed certificates** will show security warnings in browsers but still provide encryption
- **Let's Encrypt certificates** are trusted by all major browsers
- Always keep your system updated: `sudo apt update && sudo apt upgrade`
- Regularly check Docker container security updates
- Monitor your application logs for suspicious activity

## Additional Commands

### Useful Docker Commands

```bash
# View container logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Update and rebuild
docker-compose pull
docker-compose up --build -d
```

### Useful Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check configuration syntax
sudo nginx -T
```

This setup provides a robust, secure foundation for hosting your Node.js application with SSL encryption on a VPS.