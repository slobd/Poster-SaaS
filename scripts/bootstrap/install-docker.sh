 #!/bin/sh
 # 1. Update the apt package index and install packages to allow apt to use a repository over HTTPS:
 sudo apt-get update
 sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 2. Add Docker’s official GPG key:
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 3. Use the following command to set up the stable repository. 
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Update the apt package index, and install the latest version of Docker Engine and containerd
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# 5. Manage Docker as a non-root user
# The Docker daemon binds to a Unix socket instead of a TCP port. By default that Unix 
# socket is owned by the user root and other users can only access it using sudo. The 
# Docker daemon always runs as the root user.


# 6. Verify that Docker Engine is installed correctly and 
# can be run without sudo by running the hello-world image
#docker run hello-world
