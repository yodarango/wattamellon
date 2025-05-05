#!/bin/sh

# Make sure we have proper permissions
chmod +x /app/wattamellon 2>/dev/null || true

# Check the ENV variable to determine which mode to run
if [ "$ENV" = "PROD" ] || [ "$ENV" = "prod" ]; then
    echo "Running in PRODUCTION mode using wattamellon binary"
    # Run the compiled binary directly
    exec /app/wattamellon
else
    echo "Running in DEVELOPMENT mode using CompileDaemon"
    # Run CompileDaemon for hot reloading during development
    exec CompileDaemon -build="go build -o main ./cmd/main" -command="./main"
fi
