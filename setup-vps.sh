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
# Setup Nginx
# Use the default Nginx config file
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx

# Setup firewall
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Run
git clone git@github.com:gnauqoa/motorbike-rescue-backend.git
cd motorbike-rescue-backend
cp env.docker.example .env
## if not using arm, run this and replace the image name in docker-compose.yaml
git clone git@github.com:quanglng2022/mosquitto-go-auth.git
cd mosquitto-go-auth
docker build -t mosquitto-go-auth .
cd ../
cp docker-compose-2.yaml docker-compose.yaml

docker-compose up --build -d







