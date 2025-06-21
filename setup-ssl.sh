# with ip address
sudo apt install openssl -y
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=IP_ADDRESS"
sudo chmod 600 /etc/nginx/ssl/selfsigned.*
sudo vim /etc/nginx/sites-available/default # using nginx.ip.conf
sudo nginx -t
sudo systemctl reload nginx


# with domain name
sudo apt install certbot python3-certbot-nginx -y
certbot --version
sudo certbot --nginx -d DOMAIN_NAME -d www.DOMAIN_NAME
sudo certbot certificates
sudo vim /etc/nginx/sites-available/default # using nginx.domain.conf
sudo nginx -t
sudo systemctl reload nginx