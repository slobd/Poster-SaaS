#!/bin/sh
# 1. Get docker-compose binaries
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 2. Apply executable permissions to the binary
sudo chmod +x /usr/local/bin/docker-compose