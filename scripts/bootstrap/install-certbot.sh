#!/bin/sh
apt update

apt -y install snapd

snap install core

snap refresh core

snap install --classic certbot

ln -s /snap/bin/certbot /usr/bin/certbot