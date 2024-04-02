#!/bin/bash
# USAGE sudo bash scripts/nginx/get-staging-ssl-certificates.sh
# where name is the user assigned to your posterlab email
# TODO: validate $NAME argument

echo "1. Getting staging name"
# Loads only STAGING_NAME from staging.env
eval $(source $(pwd)/env/staging.env; echo STAGING_NAME="$STAGING_NAME";)

if [ -z "$STAGING_NAME" ]; 
  then echo "STAGING_NAME env variable is not set"; exit;
fi
echo "   Your staging name: ${STAGING_NAME}"

# Loads AWS keys needed to verify the subdomain for wildcard certificates
echo "2. Setting AWS_KEY"
source $(pwd)/env/letsencrypt.env

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; 
  then echo "AWS KEYS env variables are not set"; exit;
fi

echo "3. Removing nginx/letsencrypt"
rm -R $(pwd)/nginx/letsencrypt/

echo "4. Running certbot"
docker run -it --rm --name certbot \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -v "$(pwd)/nginx/letsencrypt:/etc/letsencrypt" \
  certbot/dns-route53 certonly \
  --dns-route53 \
  --agree-tos \
  -m $STAGING_NAME@posterlab.co \
  --no-eff-email \
  -d *.$STAGING_NAME-staging.pl-dev.de \
  --server https://acme-v02.api.letsencrypt.org/directory \
  # --test-cert Uncomment to test the certificates generation since letsencrypt has a limit of generated certificates


echo "5. Generating ./letsencrypt/ssl-dhparam.pem"
openssl dhparam -dsaparam -out $(pwd)/nginx/letsencrypt/ssl-dhparam.pem 4096

echo "6. Giving ownership of letsencrypt to ubuntu user"
chown ubuntu:ubuntu -R $(pwd)/nginx/letsencrypt/
