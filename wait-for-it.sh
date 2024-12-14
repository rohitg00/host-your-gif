#!/bin/sh

# Wait for a service to be ready
wait_for() {
    echo "Testing connection to $1:$2..."
    
    while ! nc -z "$1" "$2"; do
        echo "Waiting for $1:$2..."
        sleep 1
    done
    
    echo "$1:$2 is available"
}

# Check if we have enough arguments
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 host port [timeout]"
    exit 1
fi

# Extract arguments
host="$1"
port="$2"
timeout="${3:-15}"  # Default timeout of 15 seconds

# Start waiting with timeout
if timeout "$timeout" sh -c "until nc -z $host $port; do sleep 1; done"; then
    echo "Service is ready!"
    exit 0
else
    echo "Timeout reached. Service is not ready."
    exit 1
fi
