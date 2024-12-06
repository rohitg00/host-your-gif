# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build client and server
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built assets and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/db/migrations ./db/migrations

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R node:node uploads

# Use non-root user
USER node

# Add migration script
COPY --chown=node:node scripts/start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]
