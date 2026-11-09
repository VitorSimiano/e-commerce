FROM nginx:1.28-alpine



ENV API_URL=/api


ENV BACKEND_HOST=api
ENV BACKEND_PORT=8000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

COPY public /usr/share/nginx/html

EXPOSE 80