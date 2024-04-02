FROM nginx:latest

ARG TEMPLATE=production.conf.template
# Copy the letsencrypt folder that was generated previously
COPY ./letsencrypt /etc/letsencrypt

# Copy the main cofig file
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copy the template that contains the appropiate configuration
COPY ./templates/$TEMPLATE /etc/nginx/templates/default.conf.template

EXPOSE 80
EXPOSE 443