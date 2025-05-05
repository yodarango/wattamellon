# Step 1: Build the Go application
FROM golang:1.22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the application code
COPY ./cmd/main ./cmd/main
COPY ./api ./api
COPY ./internal ./internal
COPY ./config ./config
COPY ./repo ./repo

# Install build essentials
RUN apk add --no-cache build-base

# Build the production binary with static linking for better compatibility
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o wattamellon ./cmd/main

# Install CompileDaemon for development mode
RUN go install github.com/githubnemo/CompileDaemon@latest

# Step 2: Set up the Runtime Container
FROM golang:1.22-alpine

# Set the working directory inside the container
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Copy the Go binary and necessary files from the builder stage
COPY --from=builder /go/bin/CompileDaemon /usr/local/bin/CompileDaemon
COPY --from=builder /app/wattamellon /app/wattamellon
# Copy all files from builder
COPY --from=builder /app /app

# Copy startup script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
RUN chmod +x /app/wattamellon

# Expose the port
EXPOSE 8008

# Use the entrypoint script to decide which mode to run in
ENTRYPOINT ["/app/docker-entrypoint.sh"]
