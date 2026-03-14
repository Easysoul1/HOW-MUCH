"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export default function APIDocumentationPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative mt-4">
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyCode(code, id)}
        className="absolute top-3 right-3 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
      >
        {copiedSection === id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">API Documentation</h1>
        <p className="mt-2 text-gray-600">
          Access real-time Nigerian price data through our RESTful API. Perfect for fintech apps,
          research platforms, and supply chain analytics.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 text-sm">
            <div className="pb-2 mb-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Getting Started</h3>
            </div>
            <a href="#overview" className="block py-1 text-gray-600 hover:text-green-600">Overview</a>
            <a href="#authentication" className="block py-1 text-gray-600 hover:text-green-600">Authentication</a>
            <a href="#rate-limits" className="block py-1 text-gray-600 hover:text-green-600">Rate Limits</a>
            <a href="#errors" className="block py-1 text-gray-600 hover:text-green-600">Error Handling</a>
            <a href="#pagination" className="block py-1 text-gray-600 hover:text-green-600">Pagination</a>

            <div className="pt-4 pb-2 mb-2 border-b border-gray-200 mt-4">
              <h3 className="font-semibold text-gray-900">Endpoints</h3>
            </div>
            <a href="#list-products" className="block py-1 text-gray-600 hover:text-green-600">List Products</a>
            <a href="#get-product" className="block py-1 text-gray-600 hover:text-green-600">Get Product</a>
            <a href="#product-prices" className="block py-1 text-gray-600 hover:text-green-600">Product Prices</a>
            <a href="#search" className="block py-1 text-gray-600 hover:text-green-600">Search</a>
            <a href="#price-history" className="block py-1 text-gray-600 hover:text-green-600">Price History</a>

            <div className="pt-4 pb-2 mb-2 border-b border-gray-200 mt-4">
              <h3 className="font-semibold text-gray-900">Resources</h3>
            </div>
            <a href="#code-examples" className="block py-1 text-gray-600 hover:text-green-600">Code Examples</a>
          </nav>
        </aside>

        <div className="space-y-8">
          {/* Overview */}
          <Card id="overview" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Overview</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                The HowMuch API provides programmatic access to real-time grocery and commodity prices
                across Nigeria. All endpoints return JSON and use standard HTTP methods.
              </p>
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Base URL:</strong>{" "}
                  <code className="bg-white px-2 py-1 rounded text-green-700">https://api.howmuch.ng/api/v1</code>
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Available Endpoints:</strong></p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                  <li><code>GET /products/</code> — List all products</li>
                  <li><code>GET /products/&#123;slug&#125;/</code> — Get product details</li>
                  <li><code>GET /products/&#123;slug&#125;/prices/</code> — Get current prices</li>
                  <li><code>GET /search/?q=</code> — Search products &amp; prices</li>
                  <li><code>GET /prices/history/</code> — Historical price data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card id="authentication" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Authentication</h2>
              <p className="mt-3 text-gray-700">
                All API requests require an API key. Include your key in the <code className="bg-gray-100 px-2 py-0.5 rounded">X-API-Key</code> header.
              </p>
              <CodeBlock
                id="auth"
                code={`curl -H "X-API-Key: hm_live_your_api_key_here" \\
  https://api.howmuch.ng/api/v1/products/`}
              />
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Getting an API key:</strong> Contact our sales team at{" "}
                  <a href="mailto:sales@howmuch.ng" className="underline">sales@howmuch.ng</a>.
                  After payment confirmation, we'll generate a key for your organization.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card id="rate-limits" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Rate Limits</h2>
              <p className="mt-3 text-gray-700">
                Each API key has a daily request limit based on your plan. Rate limit headers are included in every response.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="py-3 pr-4 font-medium text-gray-900">Plan</th>
                      <th className="py-3 pr-4 font-medium text-gray-900">Daily Limit</th>
                      <th className="py-3 font-medium text-gray-900">Rate Limit Headers</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100"><td className="py-3 pr-4">Basic</td><td className="py-3 pr-4">10,000/day</td><td className="py-3">Included</td></tr>
                    <tr className="border-b border-gray-100"><td className="py-3 pr-4">Pro</td><td className="py-3 pr-4">50,000/day</td><td className="py-3">Included</td></tr>
                    <tr><td className="py-3 pr-4">Enterprise</td><td className="py-3 pr-4">Custom</td><td className="py-3">Included</td></tr>
                  </tbody>
                </table>
              </div>
              <CodeBlock
                id="rate-headers"
                code={`# Response headers
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9847`}
              />
            </CardContent>
          </Card>

          {/* Errors */}
          <Card id="errors" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Error Handling</h2>
              <p className="mt-3 text-gray-700">Standard HTTP status codes are used. Errors return JSON with a detail field.</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="py-3 pr-4 font-medium text-gray-900">Code</th>
                      <th className="py-3 font-medium text-gray-900">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100"><td className="py-3 pr-4"><code>200</code></td><td>Success</td></tr>
                    <tr className="border-b border-gray-100"><td className="py-3 pr-4"><code>401</code></td><td>Invalid or missing API key</td></tr>
                    <tr className="border-b border-gray-100"><td className="py-3 pr-4"><code>404</code></td><td>Resource not found</td></tr>
                    <tr><td className="py-3 pr-4"><code>429</code></td><td>Rate limit exceeded</td></tr>
                  </tbody>
                </table>
              </div>
              <CodeBlock
                id="error-example"
                code={`{
  "detail": "Invalid API key."
}`}
              />
            </CardContent>
          </Card>

          {/* Pagination */}
          <Card id="pagination" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Pagination</h2>
              <p className="mt-3 text-gray-700">
                List endpoints return paginated results. Default page size is 20, max is 100.
              </p>
              <CodeBlock
                id="pagination"
                code={`GET /api/v1/products/?page=2&page_size=50

{
  "count": 245,
  "next": "https://api.howmuch.ng/api/v1/products/?page=3&page_size=50",
  "previous": "https://api.howmuch.ng/api/v1/products/?page=1&page_size=50",
  "results": [...]
}`}
              />
            </CardContent>
          </Card>

          {/* --- ENDPOINTS --- */}

          {/* List Products */}
          <Card id="list-products" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">GET</span>
                <h2 className="font-display text-xl font-semibold text-gray-900">/products/</h2>
              </div>
              <p className="mt-3 text-gray-700">List all approved products in the catalog.</p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Query Parameters</h4>
                <div className="mt-2 text-sm space-y-2 text-gray-600">
                  <p><code className="bg-gray-100 px-1.5 rounded">search</code> — Filter by product name or category</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">category</code> — Filter by category slug</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">page</code> — Page number</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">page_size</code> — Results per page (max 100)</p>
                </div>
              </div>
              <CodeBlock
                id="list-products"
                code={`curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/?category=grains"

# Response
{
  "count": 24,
  "results": [
    {
      "slug": "rice",
      "name": "Rice",
      "category": "Grains",
      "image": "https://res.cloudinary.com/...",
      "available_sizes": [
        {"id": 1, "label": "5kg"},
        {"id": 2, "label": "10kg"},
        {"id": 3, "label": "25kg"},
        {"id": 4, "label": "50kg"}
      ]
    }
  ]
}`}
              />
            </CardContent>
          </Card>

          {/* Get Product */}
          <Card id="get-product" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">GET</span>
                <h2 className="font-display text-xl font-semibold text-gray-900">/products/&#123;slug&#125;/</h2>
              </div>
              <p className="mt-3 text-gray-700">Get detailed information about a specific product.</p>
              <CodeBlock
                id="get-product"
                code={`curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/rice/"

# Response
{
  "slug": "rice",
  "name": "Rice",
  "sku": "HM-A1B2C3D4",
  "description": "Locally grown and imported rice varieties",
  "category": "Grains",
  "image": "https://res.cloudinary.com/...",
  "available_sizes": [
    {"id": 1, "label": "5kg"},
    {"id": 2, "label": "10kg"},
    {"id": 3, "label": "25kg"},
    {"id": 4, "label": "50kg"}
  ]
}`}
              />
            </CardContent>
          </Card>

          {/* Product Prices */}
          <Card id="product-prices" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">GET</span>
                <h2 className="font-display text-xl font-semibold text-gray-900">/products/&#123;slug&#125;/prices/</h2>
              </div>
              <p className="mt-3 text-gray-700">
                Get current prices for a product from all vendors. Results sorted by price (lowest first).
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Query Parameters</h4>
                <div className="mt-2 text-sm space-y-2 text-gray-600">
                  <p><code className="bg-gray-100 px-1.5 rounded">size</code> — Filter by size label (e.g. "5kg")</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">brand</code> — Filter by brand name</p>
                </div>
              </div>
              <CodeBlock
                id="product-prices"
                code={`curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/rice/prices/?size=5kg"

# Response
{
  "count": 12,
  "results": [
    {
      "id": 45,
      "product": "Rice",
      "product_slug": "rice",
      "size": "5kg",
      "brand": "Mama Gold",
      "price": "4500.00",
      "vendor_location": {
        "city": "Lagos",
        "state": "Lagos"
      },
      "is_available": true,
      "updated_at": "2026-03-14T10:30:00Z"
    }
  ]
}`}
              />
            </CardContent>
          </Card>

          {/* Search */}
          <Card id="search" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">GET</span>
                <h2 className="font-display text-xl font-semibold text-gray-900">/search/</h2>
              </div>
              <p className="mt-3 text-gray-700">
                Search across products, brands, and categories. Returns matching price listings.
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Query Parameters</h4>
                <div className="mt-2 text-sm space-y-2 text-gray-600">
                  <p><code className="bg-gray-100 px-1.5 rounded">q</code> — Search query (required)</p>
                </div>
              </div>
              <CodeBlock
                id="search"
                code={`curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/search/?q=tomato"

# Response
{
  "count": 8,
  "results": [
    {
      "id": 78,
      "product": "Tomato Paste",
      "product_slug": "tomato-paste",
      "size": "70g",
      "brand": "Gino",
      "price": "500.00",
      "vendor_location": {"city": "Lagos", "state": "Lagos"},
      "is_available": true,
      "updated_at": "2026-03-14T08:15:00Z"
    }
  ]
}`}
              />
            </CardContent>
          </Card>

          {/* Price History */}
          <Card id="price-history" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">GET</span>
                <h2 className="font-display text-xl font-semibold text-gray-900">/prices/history/</h2>
              </div>
              <p className="mt-3 text-gray-700">
                Get historical price data. Useful for trend analysis, charts, and ML training.
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Query Parameters</h4>
                <div className="mt-2 text-sm space-y-2 text-gray-600">
                  <p><code className="bg-gray-100 px-1.5 rounded">product</code> — Filter by product slug</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">days</code> — Number of days to look back (default 30, max 365)</p>
                </div>
              </div>
              <CodeBlock
                id="price-history"
                code={`curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/prices/history/?product=rice&days=30"

# Response
{
  "count": 156,
  "results": [
    {
      "product": "Rice",
      "product_slug": "rice",
      "size": "5kg",
      "brand": "Mama Gold",
      "price": "4200.00",
      "recorded_at": "2026-03-10T14:22:00Z"
    }
  ]
}`}
              />
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card id="code-examples" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Code Examples</h2>

              <h3 className="mt-6 font-medium text-gray-900">Python</h3>
              <CodeBlock
                id="python"
                code={`import requests

API_KEY = "hm_live_your_key"
BASE_URL = "https://api.howmuch.ng/api/v1"

headers = {"X-API-Key": API_KEY}

# Get rice prices
response = requests.get(f"{BASE_URL}/products/rice/prices/", headers=headers)
prices = response.json()

for item in prices["results"]:
    print(f"{item['brand']} {item['size']}: ₦{item['price']} ({item['vendor_location']['city']})")`}
              />

              <h3 className="mt-6 font-medium text-gray-900">JavaScript / Node.js</h3>
              <CodeBlock
                id="javascript"
                code={`const API_KEY = "hm_live_your_key";
const BASE_URL = "https://api.howmuch.ng/api/v1";

const response = await fetch(\`\${BASE_URL}/products/rice/prices/\`, {
  headers: { "X-API-Key": API_KEY }
});

const { results } = await response.json();
results.forEach(item => {
  console.log(\`\${item.brand} \${item.size}: ₦\${item.price}\`);
});`}
              />

              <h3 className="mt-6 font-medium text-gray-900">cURL</h3>
              <CodeBlock
                id="curl"
                code={`# List all products
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/"

# Search for tomato prices
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/search/?q=tomato"

# Get 90-day price history for rice
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/prices/history/?product=rice&days=90"`}
              />
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-xl font-semibold text-green-900">Need Help?</h2>
              <p className="mt-2 text-green-700">
                Contact our team for integration support, custom plans, or partnership inquiries.
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                  <a href="mailto:sales@howmuch.ng">Contact Sales</a>
                </Button>
                <Button variant="outline" className="border-green-300 text-green-700" asChild>
                  <a href="mailto:dev@howmuch.ng">Developer Support</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

