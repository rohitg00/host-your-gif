#!/bin/sh
set -e

# Function to check database connection
check_db_connection() {
    echo "Waiting for database to be ready..."
    local retries=30
    local count=0
    while [ $count -lt $retries ]; do
        if nc -z $POSTGRES_HOST $POSTGRES_PORT; then
            echo "Database is ready!"
            return 0
        fi
        echo "Attempt $((count + 1))/$retries: Database not ready yet..."
        count=$((count + 1))
        sleep 1
    done
    echo "Error: Database connection timeout after $retries attempts"
    return 1
}

# Check database connection
check_db_connection || exit 1

# Run database migrations with TLS verification enabled
echo "Running database migrations..."
export NODE_TLS_REJECT_UNAUTHORIZED=1
npm run db:migrate

# Start the application with TLS verification enabled
echo "Starting the application..."
exec NODE_TLS_REJECT_UNAUTHORIZED=1 npm start
