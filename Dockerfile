# Build the static site, then serve it from nginx (which also terminates TLS).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx/http.conf.template deploy/nginx/https.conf.template /etc/nginx/qsofte/
COPY deploy/nginx/entrypoint.sh /qsofte-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html
RUN chmod +x /qsofte-entrypoint.sh && mkdir -p /var/www/certbot
EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=5s CMD wget -q --spider http://127.0.0.1/healthz || exit 1
ENTRYPOINT ["/qsofte-entrypoint.sh"]
