#!/bin/bash
# USAGE sudo bash scripts/nginx/get-staging-ssl-certificates.sh

# Loads AWS keys needed to verify the subdomain for wildcard certificates
echo "1. Setting AWS_KEY"
source $(pwd)/env/letsencrypt.env

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; 
  then echo "AWS KEYS env variables are not set"; exit;
fi

echo "2. Removing nginx/letsencrypt"
rm -R -f $(pwd)/nginx/letsencrypt/

echo "3. Running certbot"
docker run -it --rm --name certbot \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -v "$(pwd)/nginx/letsencrypt:/etc/letsencrypt" \
  certbot/dns-route53 certonly \
  --dns-route53 \
  --agree-tos \
  -m dev@posterlab.co \
  --no-eff-email \
  -d *.pl-dev.de \
  --server https://acme-v02.api.letsencrypt.org/directory \
  # --test-cert Uncomment to test the certificates generation since letsencrypt has a limit of generated certificates


echo "4. Generating ./letsencrypt/ssl-dhparam.pem"
openssl dhparam -dsaparam -out $(pwd)/nginx/letsencrypt/ssl-dhparam.pem 4096

echo "5. Giving ownership of letsencrypt to ubuntu user"
chown ubuntu:ubuntu -R $(pwd)/nginx/letsencrypt/
