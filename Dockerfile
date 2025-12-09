# Use official Deno runtime image (alpine-based for lightweight)
FROM denoland/deno:alpine-1.40.0

# Set working directory
WORKDIR /app

# Copy the application code
COPY server.ts .

# Expose the port
EXPOSE 8000

# Run the server
CMD ["run", "--allow-net", "--allow-env", "server.ts"]

