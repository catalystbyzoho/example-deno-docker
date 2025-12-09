# Deno REST API

A lightweight RESTful API built with Deno, featuring 3 endpoints and a beautiful root page that lists all available endpoints.

## Features

- 🚀 Built with Deno
- 📦 Lightweight Docker image
- 🎨 Beautiful HTML interface for endpoint documentation
- 🔄 RESTful API endpoints

## Available Endpoints

- `GET /` - Display all available endpoints with documentation
- `GET /api/items` - Get all items
- `POST /api/items` - Create a new item (requires JSON body with `name` and `description`)
- `GET /api/items/:id` - Get a specific item by ID

## Running Locally

```bash
# Run with Deno
deno run --allow-net --allow-env server.ts

# Or specify a port
PORT=3000 deno run --allow-net --allow-env server.ts
```

The server will start on `http://localhost:8000` (or the port specified in the PORT environment variable).

## Docker

### Build the image

```bash
docker build --platform=linux/amd64 -t deno-rest-api .
```

### Run the container

```bash
docker run -p 8000:8000 deno-rest-api
```

### Run with custom port

```bash
docker run -p 3000:8000 -e PORT=8000 deno-rest-api
```

## Example API Usage

### Create an item

```bash
curl -X POST http://localhost:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "This is a test item"}'
```

### Get all items

```bash
curl http://localhost:8000/api/items
```

### Get a specific item

```bash
curl http://localhost:8000/api/items/{item-id}
```

## Docker Image Size

The Docker image uses the official Deno Alpine image, which is optimized for minimal size while maintaining full functionality.

