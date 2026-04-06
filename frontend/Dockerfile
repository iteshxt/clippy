# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Non-root user for security
RUN chown node:node /app
USER node

# Cache dependencies
COPY --chown=node:node package*.json ./
RUN npm ci

# Build the application
COPY --chown=node:node . .
RUN npm run build

# Stage 2: Production (Nginx)
FROM nginx:1.25-alpine

# Set working directory to nginx resources
WORKDIR /usr/share/nginx/html

# Clean existing files
RUN rm -rf ./*

# Copy built files from Stage 1
COPY --from=builder /app/dist .

# Copy the simple, external Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
