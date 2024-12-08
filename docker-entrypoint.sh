#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 1
done
echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Start the application
echo "Starting the application..."
exec npm start
