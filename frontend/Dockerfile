FROM nginx:1.28-alpine

# default API address; compose overrides it through the environment
ENV API_URL=http://localhost:8000/api

# nginx renders every file in /etc/nginx/templates at start-up,
# replacing ${VARIABLES} with the container's environment variables
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

COPY public /usr/share/nginx/html

EXPOSE 80