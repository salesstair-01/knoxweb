# Public site: serves the latest static release + prices.json. No dependencies.
ARG NODE_IMAGE=node:22-alpine
FROM ${NODE_IMAGE}
WORKDIR /srv
COPY server.js ./
ENV NODE_ENV=production SITE_DIR=/srv/site PRICES_FILE=/srv/prices/prices.json
USER node
EXPOSE 8080
CMD ["node", "server.js"]
