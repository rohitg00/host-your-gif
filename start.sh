#!/bin/sh

# Run migrations
echo "Running database migrations..."
node dist/db/migrate.js

# Start the application
echo "Starting application..."
node dist/server/index.js
