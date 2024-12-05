# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build frontend and backend
RUN npm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Install PostgreSQL client for health checks
RUN apt-get update && \
    apt-get install -y postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/db/migrations ./db/migrations
COPY --from=builder /app/db/migrations/meta ./db/migrations/meta

# Create and set permissions for uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Set production environment
ENV NODE_ENV=production

# Copy startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Start the application
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
