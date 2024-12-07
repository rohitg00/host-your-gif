# Build stage
FROM node:20-slim as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build client first
RUN npm run build:client

# Build server
RUN npm run build

# Production stage
FROM node:20-slim as runner

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built files and migrations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/db/migrations ./db/migrations

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R node:node /app

# Use non-root user
USER node

# Expose port 3000 (as specified in Kinsta docs)
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Run migrations and start the app
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]
