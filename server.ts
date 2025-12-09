// Minimal Deno global declaration for local tooling; runtime provides real value.
declare const Deno: {
  env: { get(key: string): string | undefined };
  serve: (...args: any[]) => any;
};

interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

// In-memory data store
const items: Map<string, Item> = new Map();

// Helper function to parse JSON body
async function parseBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Helper function to send JSON response
function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Root endpoint - displays available endpoints
function handleRoot(): Response {
  const endpoints = [
    {
      path: "/",
      method: "GET",
      description: "List all available endpoints",
    },
    {
      path: "/api/items",
      method: "GET",
      description: "Get all items",
    },
    {
      path: "/api/items",
      method: "POST",
      description: "Create a new item (requires JSON body with 'name' and 'description')",
    },
    {
      path: "/api/items/:id",
      method: "GET",
      description: "Get a specific item by ID",
    },
  ];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deno REST API</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-top: 0;
        }
        .endpoint {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .method {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
        }
        .method.get { background: #28a745; color: white; }
        .method.post { background: #007bff; color: white; }
        .method.put { background: #ffc107; color: black; }
        .method.delete { background: #dc3545; color: white; }
        .path {
            font-family: 'Courier New', monospace;
            color: #667eea;
            font-weight: bold;
        }
        .description {
            color: #666;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Deno REST API</h1>
        <p>Available endpoints:</p>
        ${endpoints.map(endpoint => `
            <div class="endpoint">
                <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <span class="path">${endpoint.path}</span>
                <div class="description">${endpoint.description}</div>
            </div>
        `).join('')}
    </div>
</body>
</html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Encoding": "identity",
      "Vary": "Accept-Encoding",
    },
  });
}

// GET /api/items - Get all items
function handleGetItems(): Response {
  const itemsArray = Array.from(items.values());
  return jsonResponse({ items: itemsArray, count: itemsArray.length });
}

// POST /api/items - Create a new item
async function handleCreateItem(request: Request): Promise<Response> {
  const body = await parseBody(request);
  
  if (!body || !body.name || !body.description) {
    return jsonResponse(
      { error: "Missing required fields: 'name' and 'description'" },
      400
    );
  }

  const id = crypto.randomUUID();
  const item: Item = {
    id,
    name: body.name,
    description: body.description,
    createdAt: new Date().toISOString(),
  };

  items.set(id, item);
  return jsonResponse({ message: "Item created successfully", item }, 201);
}

// GET /api/items/:id - Get a specific item
function handleGetItem(id: string): Response {
  const item = items.get(id);
  
  if (!item) {
    return jsonResponse({ error: "Item not found" }, 404);
  }

  return jsonResponse({ item });
}

// Main request handler
async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Root endpoint
  if (path === "/" && method === "GET") {
    return handleRoot();
  }

  // GET /api/items
  if (path === "/api/items" && method === "GET") {
    return handleGetItems();
  }

  // POST /api/items
  if (path === "/api/items" && method === "POST") {
    return await handleCreateItem(request);
  }

  // GET /api/items/:id
  const itemMatch = path.match(/^\/api\/items\/([^\/]+)$/);
  if (itemMatch && method === "GET") {
    return handleGetItem(itemMatch[1]);
  }

  // 404 Not Found
  return jsonResponse({ error: "Endpoint not found" }, 404);
}

// Start the server (Using Native Deno.serve)
const port = parseInt(Deno.env.get("PORT") || "9000");

// Deno.serve returns a server instance, but we can just let it run
Deno.serve({ 
    port, 
    hostname: "0.0.0.0",
    onListen: ({ port, hostname }) => {
        console.log(`🚀 Server running on http://${hostname}:${port}`);
    }
}, handler);