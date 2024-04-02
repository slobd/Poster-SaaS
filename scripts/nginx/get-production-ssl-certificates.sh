#!/bin/bash
# USAGE sudo bash scripts/nginx/get-production-ssl-certificates.sh
# where name is the user assigned to your posterlab email
# TODO: validate $NAME argument

echo "Removing nginx/letsencrypt"
rm -R $(pwd)/nginx/letsencrypt/

echo "Running certbot"
docker run -it --rm --name certbot \
  -v "$(pwd)/nginx/letsencrypt:/etc/letsencrypt" \
  certbot/certbot certonly \
  --agree-tos \
  --email dev@posterlab.co \
  --no-eff-email \
  --manual \
  --preferred-challenges=dns \
  --server https://acme-v02.api.letsencrypt.org/directory \
  -d *.posterlab.co
  # --test-cert Uncomment to test the certificates generation since letsencrypt has a limit of generated certificates


echo "Removing ./letsencrypt/ssl-dhparam.pem"
rm $(pwd)/nginx/letsencrypt/ssl-dhparam.pem

echo "Generating ./letsencrypt/ssl-dhparam.pem"
openssl dhparam -dsaparam -out $(pwd)/nginx/letsencrypt/ssl-dhparam.pem 4096

echo "Giving ownership of letsencrypt to ubuntu user"
chown ubuntu:ubuntu -R $(pwd)/nginx/letsencrypt/
