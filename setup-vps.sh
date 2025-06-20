sudo apt update

sudo apt install fish -y
# Setup docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt-cache policy docker-ce
sudo apt install docker-ce
sudo systemctl start docker
# Github ssh
ssh-keygen -t rsa -b 4096 -C "email@gmail.com"
cd ~/.ssh
cat id_rsa.pub
# Setup SSL
sudo mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout selfsigned.key \
  -out selfsigned.crt \
  -subj "/C=VN/ST=HCM/L=HCM/O=QuangDev/OU=Dev/CN=$(curl -s ifconfig.me)"

# Setup Nginx
sudo vim /etc/nginx/sites-available/nest
# add ngix config to file
sudo ln -s /etc/nginx/sites-available/nest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup firewall
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Run
git clone https://github.com/gnauqoa/motorbike-rescue-backend
cd motorbike-rescue-backend
cp env.docker.example .env
## if not using arm, run this and replace the image name in docker-compose.yaml
git clone https://github.com/quanglng2022/mosquitto-go-auth.git
cd mosquitto-go-auth
docker build -t mosquitto-go-auth .
cd ../
cp docker-compose-2.yaml docker-compose.yaml

docker-compose up --build -d







