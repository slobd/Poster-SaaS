# Posterlab
The project runs with three different services:
1. Webapp
2. Nest backend
3. CMS

The deployment can be done in three different environments. You can find how to setup in each environment in the following sections.

**Table of Contents** 
- [Posterlab](#posterlab)
  * [How to setup](#how-to-setup)
    + [1. Install project dependencies](#1-install-project-dependencies)
    + [2. Environment variables](#2-environment-variables)
    + [3. Install node_modules](#3-install-node-modules)
    + [4. Database setup](#4-database-setup)
      - [Manually start database:](#manually-start-database-)
      - [Reset or drop all databases in dev environment:](#reset-or-drop-all-databases-in-dev-environment-)
    + [Run the app using Docker](#run-the-app-using-docker)
      - [1. Dev environment](#1-dev-environment)
      - [2. Staging environment](#2-staging-environment)
      - [3. Production environment](#3-production-environment)
    + [Run the app without docker](#run-the-app-without-docker)
      - [1. Webapp](#1-webapp)
      - [2. Nest backend](#2-nest-backend)
      - [3. CMS](#3-cms)
  * [Other Information](#other-information)
    + [1. Naming convention](#1-naming-convention)
    + [2. Commit changes](#2-commit-changes)


## How to setup

### 1. Install project dependencies

NodeJS and Docker are needed to run to project. Therefore if you are running it on your
personal machine, you need to have Node.js LTS (v14.x) and Docker installed.

We use yarn as package manager so be sure to have it installed (current version 1.22.17)

If you are running it in a Ubuntu 18 operating system you can install the dependencies by opening a terminal in the root folder of the project and running the following commands:
```bash
# To install NodeJS
sudo sh scripts/bootstrap/install-node.sh
```
```bash
# To install Docker
sudo sh scripts/bootstrap/install-docker.sh
```
```bash
# To install Docker Compose
sudo sh scripts/bootstrap/install-docker-compose.sh
```
```bash
# To run Docker without sudo
sudo sh scripts/bootstrap/run-docker-without-sudo.sh
```
### 2. Environment variables

#### 2.1 Docker

The environmental variables are stored inside the env files which are saved inside the /env folder. There are two examples files inside the /env folder which you can take a reference from:

- example.env contains all the enviroment variables needed to run the whole app
- letsencrypt.example.env contains the AWS keys necessary to automatically verify a domain (pl-dev.de) when generating the SSL certificates. This env file is only used in staging environment


For staging you need to copy letsencrypt.example.env and rename it to letsencrypt.env and add the AWS keys given to you by a project manager.

The docker-compose setup takes into account that you can run the app with 3 different environments (development, staging and production) if needed in the same machine.

To run any of those enviroments you need to copy example.env into dev.env, staging.env or production.env depending on the environment you want to run.

### 3. Install node_modules

Run `yarn install` inside the root folder to install all the dev depencies. We use yarn to execute common scripts like running docker or cleaning the databases in development.

### 4. Database setup
The project uses postgresql database for storing information. When running the project in staging and production environments using docker, the postgresql database is automatically created or connected.

#### Manually start database:
When running in the dev environment the database needs to be started seperately. Run the following command to start the postgresql instance using docker:

```
yarn deploy:postgres
```

#### Reset or drop all databases in dev environment:

- If the dev instances are not active run the following command to drop all databases: 
```
yarn clean:postgres
```
- If the dev instances are active run the following command to automcatically stop the instances first and then to clear and redeploy the postgresql instance only:
```
yarn restart:postgres
```

### Run the app using Docker

#### 1. Dev environment
Be sure env/dev.env exist and have the right values
```bash
# To start the dev instances
yarn deploy:dev:up

# To stop the dev instances
yarn deploy:dev:down
```

#### 2. Staging environment

Be sure env/letsencrypt.env and env/staging.env exist and have the right values
```bash
# Get SSL certificates for staging
sudo bash scripts/nginx/get-staging-ssl-certificates.sh

# To start staging instances
yarn deploy:staging:up

# To stop staging instances
yarn deploy:staging:down
```

#### 3. Production environment

Be sure env/letsencrypt.env and env/production.env exist and have the right values

If there is not nginx/letsencrypt/live/posterlab.co folder with the production SSL certificates or they are about to expire you need to run
```bash
# Get SSL certificates for production
sudo bash scripts/nginx/get-production-ssl-certificates.sh
```

```bash
# Build the production images
yarn docker:build

# To start production instances
yarn deploy:prod:up

# To stop production instances
yarn deploy:prod:down
```

### Run the app without docker

#### 1. Web app
Create a .env file inside the `web-app-material` folder using the an example.env file inside the same folder as a reference. 

Open a terminal inside the web-app folder and run the following command to install all the necessary packages needed for the web-app to run:
```
yarn install
```

You need to fill the values of the following variables (will be given to you as part of the onboarding)
- LOCAL_ACCOUNT_ISSUER
- AZURE_AUTHORIZE_ENDPOINT
- AZURE_AD_B2C_CLIENT_ID
- WEB_APP_AZURE_URL_PART1
- WEB_APP_AZURE_URL_PART2
- WEB_APP_AZURE_SIGN_UP_URL


Once packages are installed you can start the app. Notice you may need to run the app in a different port based on the tenant you want to access, for example when running with the seeding script (it's on by default when running dev) it will create a tenant in port 3001.

Execute the following command to start the web-app:
```bash
# To run the app in default port 3000
yarn dev

# To run the app in custom port
yarn dev --port <port-number>

# For example to access the tenant created by the seeding script
yarn dev --port 3001
```



#### 2. CMS
Create a .env file inside the `cms` folder using the an example.env file inside the same folder as a reference. 

You only need to add your AWS keys to the .env file and change the S3_BUCKET variable as described inside the cms/example.env file, use the default values for the rest of the variables.

Open a terminal inside the cms folder and run the following command to install all the necessary packages needed for the cms to run:
```bash
yarn install
```

Once packages are installed execute the following command to start cms:
```bash
# CMS will start running in the default port 7999
yarn dev
```

#### 3. Nest backend
Create a .env file inside the `nest-backend` folder using the an example.env file inside the same folder as a reference. 

You need to fill the values of the following variables (will be given to you as part of the onboarding)
- AZURE_AD_B2C_CLIENT_ID
- AZURE_AD_B2C_CLIENT_SECRET
- AZURE_TENANT_ID
- AZURE_CLIENT_ID
- AZURE_CLIENT_SECRET
- LOCAL_ACCOUNT_ISSUER
- GRAPH_TOKEN_URL
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- S3_BUCKET (read the comment inside nest-backend/example.env to know the value)

Open a terminal inside the nest-backend folder and run the following command to install all the necessary packages needed for the backend to run:
```bash
yarn install
```

Once packages are installed execute the following command to start the nest-backend:
```bash
# Backend will start running in the default port 2828
yarn dev
```

We would recommend to look up how to run a debugger for a nestjs application based on your IDE

## Other Information

### 1. Commit changes

When making a commit use `yarn commit` since it make it easier to follow the conventional commits


