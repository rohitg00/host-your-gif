# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files and TypeScript configs
COPY package*.json ./
COPY tsconfig.json ./
COPY client/package*.json ./client/
COPY client/tsconfig*.json ./client/
COPY server/tsconfig.json ./server/
COPY db/tsconfig.json ./db/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build everything
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built artifacts and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/start.sh ./start.sh

# Set proper permissions
RUN mkdir -p uploads && \
    chown -R appuser:appgroup /app && \
    chmod +x /app/start.sh

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Start the application using the startup script
CMD ["sh", "./start.sh"]
