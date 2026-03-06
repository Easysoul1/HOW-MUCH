"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function APIDocumentationPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-gray-900">API Documentation</h1>
        <p className="mt-2 text-gray-600">
          Access real-time Nigerian price data through our RESTful API. Perfect for fintech apps, 
          research platforms, and supply chain analytics.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 text-sm">
            <div className="pb-2 mb-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Getting Started</h3>
            </div>
            <a href="#overview" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">Overview</a>
            <a href="#authentication" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">Authentication</a>
            <a href="#rate-limits" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">Rate Limits</a>
            <a href="#errors" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">Error Handling</a>
            
            <div className="pt-4 pb-2 mb-2 border-b border-gray-200 mt-4">
              <h3 className="font-semibold text-gray-900">Endpoints</h3>
            </div>
            <a href="#list-products" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">List Products</a>
            <a href="#get-product" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">Get Product</a>
            <a href="#get-prices" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">Get Prices</a>
            <a href="#search" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">Search</a>
            
            <div className="pt-4 pb-2 mb-2 border-b border-gray-200 mt-4">
              <h3 className="font-semibold text-gray-900">Resources</h3>
            </div>
            <a href="#code-examples" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">Code Examples</a>
            <a href="#webhooks" className="block py-1 text-gray-600 hover:text-green-600 transition-colors">Webhooks</a>
          </nav>
        </aside>

        <div className="space-y-8">
          {/* Overview */}
          <Card id="overview" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Overview</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                The HowMuch API provides programmatic access to real-time grocery and commodity prices 
                across Nigeria. All endpoints return JSON responses and use standard HTTP methods.
              </p>
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Base URL:</strong> <code className="bg-white px-2 py-1 rounded">https://api.howmuch.ng/v1</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card id="authentication" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Authentication</h2>
              <p className="mt-3 text-gray-700">
                All API requests require authentication using Bearer tokens. Include your API key in the Authorization header.
              </p>
              
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Header Format</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-green-400 overflow-x-auto">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => copyCode("Authorization: Bearer YOUR_API_KEY", "auth")}
                  >
                    {copiedSection === "auth" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Get Your API Key</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Generate and manage your API keys from the dashboard.
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <a href="/integrator/keys" className="flex items-center gap-2">
                    Go to API Keys
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card id="rate-limits" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Rate Limits</h2>
              <p className="mt-3 text-gray-700">
                Rate limits vary by plan. The API returns rate limit information in response headers.
              </p>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">X-RateLimit-Limit</span>
                  <span className="font-mono text-gray-900">Total requests per hour</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">X-RateLimit-Remaining</span>
                  <span className="font-mono text-gray-900">Remaining requests</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">X-RateLimit-Reset</span>
                  <span className="font-mono text-gray-900">Unix timestamp of reset</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Handling */}
          <Card id="errors" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Error Handling</h2>
              <p className="mt-3 text-gray-700">
                The API uses standard HTTP status codes. All errors return a JSON response with an error message.
              </p>
              
              <div className="mt-6 space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm font-semibold text-gray-900">200</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">OK</p>
                      <p className="text-sm text-gray-600">Request successful</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm font-semibold text-red-700">401</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Unauthorized</p>
                      <p className="text-sm text-gray-600">Invalid or missing API key</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm font-semibold text-yellow-700">429</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Rate Limit Exceeded</p>
                      <p className="text-sm text-gray-600">Too many requests</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm font-semibold text-orange-700">500</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Internal Server Error</p>
                      <p className="text-sm text-gray-600">Something went wrong on our end</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Error Response Format</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-gray-300 overflow-x-auto">{`{
  "error": {
    "message": "Invalid API key provided",
    "type": "authentication_error",
    "code": "invalid_key"
  }
}`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* List Products */}
          <Card id="list-products" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-mono text-sm font-semibold">GET</span>
                <h2 className="font-display text-xl font-semibold text-gray-900">List Products</h2>
              </div>
              <p className="text-gray-700">Retrieve a paginated list of all available products.</p>
              
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Endpoint</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-green-400">GET /products</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => copyCode("GET /products", "list-products")}
                  >
                    {copiedSection === "list-products" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Query Parameters</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-4 py-2 border-b border-gray-100">
                    <span className="font-mono text-gray-900 w-32">category</span>
                    <span className="text-gray-600 flex-1">Filter by category slug</span>
                  </div>
                  <div className="flex gap-4 py-2 border-b border-gray-100">
                    <span className="font-mono text-gray-900 w-32">page</span>
                    <span className="text-gray-600 flex-1">Page number (default: 1)</span>
                  </div>
                  <div className="flex gap-4 py-2">
                    <span className="font-mono text-gray-900 w-32">page_size</span>
                    <span className="text-gray-600 flex-1">Items per page (default: 20, max: 100)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Example Response</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-xs">
                  <pre className="text-gray-300 overflow-x-auto">{`{
  "count": 1247,
  "next": "https://api.howmuch.ng/v1/products?page=2",
  "previous": null,
  "results": [
    {
      "id": 42,
      "name": "Golden Penny Semovita",
      "slug": "golden-penny-semovita",
      "category": {
        "id": 3,
        "name": "Grains & Cereals",
        "slug": "grains-cereals"
      },
      "image": "https://res.cloudinary.com/.../image.jpg",
      "available_sizes": [
        {"id": 12, "label": "1kg"},
        {"id": 13, "label": "5kg"}
      ]
    }
  ]
}`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Get Product */}
          <Card id="get-product" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-mono text-sm font-semibold">GET</span>
                <h2 className="font-display text-xl font-semibold text-gray-900">Get Product</h2>
              </div>
              <p className="text-gray-700">Retrieve details for a specific product.</p>
              
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Endpoint</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-green-400">GET /products/:slug</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => copyCode("GET /products/:slug", "get-product")}
                  >
                    {copiedSection === "get-product" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Example Request</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-gray-300">{`curl https://api.howmuch.ng/v1/products/golden-penny-semovita \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Get Prices */}
          <Card id="get-prices" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-mono text-sm font-semibold">GET</span>
                <h2 className="font-display text-xl font-semibold text-gray-900">Get Prices</h2>
              </div>
              <p className="text-gray-700">Fetch current prices for a product across different vendors and locations.</p>
              
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Endpoint</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-green-400">GET /products/:slug/prices</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => copyCode("GET /products/:slug/prices", "get-prices")}
                  >
                    {copiedSection === "get-prices" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Query Parameters</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-4 py-2 border-b border-gray-100">
                    <span className="font-mono text-gray-900 w-32">size</span>
                    <span className="text-gray-600 flex-1">Filter by size ID</span>
                  </div>
                  <div className="flex gap-4 py-2 border-b border-gray-100">
                    <span className="font-mono text-gray-900 w-32">city</span>
                    <span className="text-gray-600 flex-1">Filter by city (e.g., "Lagos", "Abuja")</span>
                  </div>
                  <div className="flex gap-4 py-2">
                    <span className="font-mono text-gray-900 w-32">min_price</span>
                    <span className="text-gray-600 flex-1">Minimum price filter</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Example Response</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-xs">
                  <pre className="text-gray-300 overflow-x-auto">{`{
  "product": {
    "name": "Golden Penny Semovita",
    "slug": "golden-penny-semovita"
  },
  "prices": [
    {
      "id": 1523,
      "price": 4500,
      "size": {"id": 12, "label": "5kg"},
      "vendor": {
        "business_name": "Shoprite Ikeja",
        "city": "Lagos",
        "state": "Lagos"
      },
      "brand": "Golden Penny",
      "in_stock": true,
      "updated_at": "2024-02-28T10:30:00Z"
    }
  ],
  "price_stats": {
    "avg": 4650,
    "min": 4200,
    "max": 5100,
    "count": 23
  }
}`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card id="search" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-mono text-sm font-semibold">GET</span>
                <h2 className="font-display text-xl font-semibold text-gray-900">Search</h2>
              </div>
              <p className="text-gray-700">Search products by name or description.</p>
              
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Endpoint</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-green-400">GET /search?q=rice</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => copyCode("GET /search?q=rice", "search")}
                  >
                    {copiedSection === "search" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card id="code-examples" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Code Examples</h2>
              
              <div className="mt-6 space-y-6">
                {/* Python */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Python</h3>
                  <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-xs">
                    <pre className="text-gray-300 overflow-x-auto">{`import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://api.howmuch.ng/v1"

headers = {"Authorization": f"Bearer {API_KEY}"}

# Get products
response = requests.get(f"{BASE_URL}/products", headers=headers)
products = response.json()

# Get prices for a product
response = requests.get(
    f"{BASE_URL}/products/golden-penny-semovita/prices",
    headers=headers,
    params={"city": "Lagos"}
)
prices = response.json()`}</pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => copyCode(`import requests\n\nAPI_KEY = "your_api_key_here"\nBASE_URL = "https://api.howmuch.ng/v1"\n\nheaders = {"Authorization": f"Bearer {API_KEY}"}\n\n# Get products\nresponse = requests.get(f"{BASE_URL}/products", headers=headers)\nproducts = response.json()\n\n# Get prices for a product\nresponse = requests.get(\n    f"{BASE_URL}/products/golden-penny-semovita/prices",\n    headers=headers,\n    params={"city": "Lagos"}\n)\nprices = response.json()`, "python")}
                    >
                      {copiedSection === "python" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* JavaScript */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">JavaScript (Node.js)</h3>
                  <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-xs">
                    <pre className="text-gray-300 overflow-x-auto">{`const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.howmuch.ng/v1';

const headers = {
  'Authorization': \`Bearer \${API_KEY}\`
};

// Get products
const getProducts = async () => {
  const response = await axios.get(
    \`\${BASE_URL}/products\`,
    { headers }
  );
  return response.data;
};

// Get prices
const getPrices = async (productSlug, city) => {
  const response = await axios.get(
    \`\${BASE_URL}/products/\${productSlug}/prices\`,
    {
      headers,
      params: { city }
    }
  );
  return response.data;
};`}</pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => copyCode(`const axios = require('axios');\n\nconst API_KEY = 'your_api_key_here';\nconst BASE_URL = 'https://api.howmuch.ng/v1';\n\nconst headers = {\n  'Authorization': \`Bearer \${API_KEY}\`\n};\n\n// Get products\nconst getProducts = async () => {\n  const response = await axios.get(\n    \`\${BASE_URL}/products\`,\n    { headers }\n  );\n  return response.data;\n};\n\n// Get prices\nconst getPrices = async (productSlug, city) => {\n  const response = await axios.get(\n    \`\${BASE_URL}/products/\${productSlug}/prices\`,\n    {\n      headers,\n      params: { city }\n    }\n  );\n  return response.data;\n};`, "javascript")}
                    >
                      {copiedSection === "javascript" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* cURL */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">cURL</h3>
                  <div className="relative bg-gray-900 rounded-lg p-4 font-mono text-xs">
                    <pre className="text-gray-300 overflow-x-auto">{`# Get products
curl https://api.howmuch.ng/v1/products \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Get prices with city filter
curl "https://api.howmuch.ng/v1/products/golden-penny-semovita/prices?city=Lagos" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => copyCode(`# Get products\ncurl https://api.howmuch.ng/v1/products \\\n  -H "Authorization: Bearer YOUR_API_KEY"\n\n# Get prices with city filter\ncurl "https://api.howmuch.ng/v1/products/golden-penny-semovita/prices?city=Lagos" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`, "curl")}
                    >
                      {copiedSection === "curl" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card id="webhooks" className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Webhooks</h2>
              <p className="mt-3 text-gray-700">
                Webhooks allow you to receive real-time notifications when price data changes.
              </p>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Coming Soon:</strong> Webhook functionality is currently in development. 
                  You'll be able to subscribe to events like price updates, new products, and more.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-gray-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Need Help?</h2>
              <p className="mt-2 text-gray-700">
                Our developer support team is here to help you integrate the HowMuch API.
              </p>
              <div className="mt-6 flex gap-4 justify-center">
                <Button className="bg-green-600 hover:bg-green-700">
                  Contact Support
                </Button>
                <Button variant="outline" className="border-gray-300">
                  View Status Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
