#!/bin/sh
# 1. Create the docker group.
getent group docker || sudo groupadd docker

# 2. Add your user to the docker group.
sudo usermod -aG docker $USER

# 3. Log out and log back in so that your group membership is re-evaluated.
newgrp docker