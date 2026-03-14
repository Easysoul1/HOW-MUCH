"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, FileText } from "lucide-react";

const DOCS_MARKDOWN = `# HowMuch API Documentation

> Access real-time Nigerian price data through our RESTful API.

## Base URL

\`\`\`
https://api.howmuch.ng/api/v1
\`\`\`

## Authentication

All API requests require an API key. Include your key in the \`X-API-Key\` header.

\`\`\`bash
curl -H "X-API-Key: hm_live_your_api_key_here" \\
  https://api.howmuch.ng/api/v1/products/
\`\`\`

## Rate Limits

| Plan       | Daily Limit | Rate Limit Headers |
|------------|-------------|-------------------|
| Basic      | 10,000/day  | Included          |
| Pro        | 50,000/day  | Included          |
| Enterprise | Custom      | Included          |

Response headers:
\`\`\`
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9847
\`\`\`

## Error Handling

| Status Code | Meaning                        |
|-------------|--------------------------------|
| 200         | Success                        |
| 400         | Bad request / invalid params   |
| 401         | Missing or invalid API key     |
| 404         | Resource not found             |
| 429         | Rate limit exceeded            |
| 500         | Server error                   |

Error response format:
\`\`\`json
{ "detail": "Invalid API key." }
\`\`\`

## Pagination

All list endpoints support pagination:

| Parameter   | Default | Max |
|-------------|---------|-----|
| page        | 1       | —   |
| page_size   | 20      | 100 |

Response includes \`count\`, \`next\`, \`previous\`, and \`results\`.

---

## Endpoints

### GET /products/

List all approved products.

**Query Parameters:**
- \`search\` — Filter by product name or category
- \`category\` — Filter by category slug
- \`page\` / \`page_size\` — Pagination

\`\`\`bash
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/?category=grains"
\`\`\`

### GET /products/{slug}/

Get detailed information about a specific product.

\`\`\`bash
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/rice/"
\`\`\`

### GET /products/{slug}/prices/

Get current prices from all vendors. Supports location-based filtering.

**Query Parameters:**
- \`size\` — Filter by size label (e.g. "5kg")
- \`brand\` — Filter by brand name
- \`city\` — Filter by vendor city (case-insensitive)
- \`latitude\` — Your latitude (for geo-filtering)
- \`longitude\` — Your longitude (for geo-filtering)
- \`max_distance\` — Maximum distance in km

\`\`\`bash
# Basic
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/rice/prices/?size=5kg"

# With location (10km radius around Ikeja)
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/rice/prices/?latitude=6.6018&longitude=3.3515&max_distance=10"

# By city
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/rice/prices/?city=ibadan"
\`\`\`

### GET /search/

Search across products, brands, and categories. Supports location filtering.

**Query Parameters:**
- \`q\` — Search query (required)
- \`city\` — Filter by vendor city
- \`latitude\` / \`longitude\` / \`max_distance\` — Geo-radius filter

\`\`\`bash
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/search/?q=tomato&city=lagos"
\`\`\`

### GET /prices/history/

Historical price data for trend analysis.

**Query Parameters:**
- \`product\` — Filter by product slug
- \`days\` — Number of days to look back (default 30, max 365)

\`\`\`bash
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/prices/history/?product=rice&days=90"
\`\`\`

---

## Location Filtering

### Filter by City
Use the \`city\` parameter for case-insensitive partial matching.
\`\`\`
GET /api/v1/products/rice/prices/?city=ibadan
GET /api/v1/search/?q=garri&city=lagos
\`\`\`

### Geo-Radius Filter
Pass \`latitude\`, \`longitude\`, and \`max_distance\` (km). Response includes \`distance_km\`.
\`\`\`
GET /api/v1/products/rice/prices/?latitude=7.3775&longitude=3.9470&max_distance=15
\`\`\`

### Combined
\`\`\`
GET /api/v1/search/?q=bread&city=lagos&latitude=6.4281&longitude=3.4219&max_distance=5
\`\`\`

---

## Code Examples

### Python
\`\`\`python
import requests

API_KEY = "hm_live_your_key"
BASE_URL = "https://api.howmuch.ng/api/v1"
headers = {"X-API-Key": API_KEY}

response = requests.get(f"{BASE_URL}/products/rice/prices/", headers=headers)
prices = response.json()

for item in prices["results"]:
    print(f"{item['brand']} {item['size']}: ₦{item['price']} ({item['vendor_location']['city']})")
\`\`\`

### JavaScript / Node.js
\`\`\`javascript
const API_KEY = "hm_live_your_key";
const BASE_URL = "https://api.howmuch.ng/api/v1";

const response = await fetch(\`\${BASE_URL}/products/rice/prices/\`, {
  headers: { "X-API-Key": API_KEY }
});

const { results } = await response.json();
results.forEach(item => {
  console.log(\`\${item.brand} \${item.size}: ₦\${item.price}\`);
});
\`\`\`

### cURL
\`\`\`bash
# List all products
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/"

# Search for tomato prices
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/search/?q=tomato"

# Get 90-day price history
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/prices/history/?product=rice&days=90"
\`\`\`

---

## Support

- **Sales:** sales@howmuch.ng
- **Developer Support:** dev@howmuch.ng
`;

export default function APIDocumentationPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([DOCS_MARKDOWN], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "howmuch-api-docs.md";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadPdf = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Convert markdown to simple HTML for print
    const html = DOCS_MARKDOWN
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
      .replace(/^---$/gm, "<hr/>")
      .replace(/\`\`\`(\w*)\n([\s\S]*?)\`\`\`/gm, "<pre><code>$2</code></pre>")
      .replace(/\`([^`]+)\`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^\| (.+) \|$/gm, (match) => {
        const cells = match.split("|").filter(Boolean).map((c) => c.trim());
        return "<tr>" + cells.map((c) => `<td style="padding:4px 12px;border:1px solid #ddd">${c}</td>`).join("") + "</tr>";
      })
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/\n\n/g, "<br/><br/>");

    printWindow.document.write(`<!DOCTYPE html><html><head>
      <title>HowMuch API Documentation</title>
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
        h1 { font-size: 28px; border-bottom: 2px solid #16a34a; padding-bottom: 8px; }
        h2 { font-size: 22px; margin-top: 32px; color: #16a34a; }
        h3 { font-size: 18px; margin-top: 24px; }
        pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        pre code { background: none; padding: 0; }
        table { border-collapse: collapse; margin: 12px 0; }
        blockquote { border-left: 3px solid #16a34a; padding-left: 12px; color: #555; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
        li { margin: 4px 0; }
        @media print { body { margin: 20px; } }
      </style>
    </head><body>${html}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  }, []);

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="mt-2 text-gray-600">
            Access real-time Nigerian price data through our RESTful API. Perfect for fintech apps,
            research platforms, and supply chain analytics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadMarkdown} className="text-gray-600">
            <FileText className="w-4 h-4 mr-1.5" /> .md
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPdf} className="text-gray-600">
            <Download className="w-4 h-4 mr-1.5" /> PDF
          </Button>
        </div>
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
            <a href="#location-filtering" className="block py-1 text-gray-600 hover:text-green-600">Location Filtering</a>

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
                  <strong>Getting an API key:</strong> Once your organization has an account, log in to the{" "}
                  <a href="/integrator/login" className="underline">API Console</a> to generate and manage your keys.
                  To get started, contact our sales team at{" "}
                  <a href="mailto:sales@howmuch.ng" className="underline">sales@howmuch.ng</a>.
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
                Supports location-based filtering to find vendors near you.
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Query Parameters</h4>
                <div className="mt-2 text-sm space-y-2 text-gray-600">
                  <p><code className="bg-gray-100 px-1.5 rounded">size</code> — Filter by size label (e.g. &quot;5kg&quot;)</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">brand</code> — Filter by brand name</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">city</code> — Filter by vendor city (e.g. &quot;Lagos&quot;, &quot;Ibadan&quot;, &quot;Abuja&quot;)</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">latitude</code> — Your latitude (for distance filtering)</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">longitude</code> — Your longitude (for distance filtering)</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">max_distance</code> — Maximum distance in km from lat/lon</p>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Location filtering:</strong> Pass <code>latitude</code>, <code>longitude</code>, and <code>max_distance</code> together
                  to get only vendors within that radius. The response includes a <code>distance_km</code> field when coordinates are provided.
                  Alternatively, use <code>city</code> to filter by city name (case-insensitive partial match).
                </p>
              </div>
              <CodeBlock
                id="product-prices"
                code={`# Basic: get all prices for rice 5kg
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/rice/prices/?size=5kg"

# With location: vendors within 10km of Ikeja, Lagos
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/rice/prices/?size=5kg&latitude=6.6018&longitude=3.3515&max_distance=10"

# By city name
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/products/rice/prices/?city=ibadan"

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
        "state": "Lagos",
        "latitude": 6.6018,
        "longitude": 3.3515
      },
      "distance_km": 2.4,
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
                Supports location-based filtering just like the prices endpoint.
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Query Parameters</h4>
                <div className="mt-2 text-sm space-y-2 text-gray-600">
                  <p><code className="bg-gray-100 px-1.5 rounded">q</code> — Search query (required)</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">city</code> — Filter by vendor city</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">latitude</code> — Your latitude</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">longitude</code> — Your longitude</p>
                  <p><code className="bg-gray-100 px-1.5 rounded">max_distance</code> — Maximum distance in km</p>
                </div>
              </div>
              <CodeBlock
                id="search"
                code={`# Search for tomato in Lagos
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/search/?q=tomato&city=lagos"

# Search with geo-radius (5km around Ibadan)
curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/search/?q=rice&latitude=7.3775&longitude=3.9470&max_distance=5"

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
      "vendor_location": {
        "city": "Lagos",
        "state": "Lagos",
        "latitude": 6.5244,
        "longitude": 3.3792
      },
      "distance_km": 3.1,
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

          {/* Location Filtering Guide */}
          <Card id="location-filtering" className="border-gray-200 bg-white">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold text-gray-900">Location Filtering</h2>
              <p className="mt-3 text-gray-700">
                The prices and search endpoints support two types of location filtering,
                which can be combined for precise results.
              </p>

              <h3 className="mt-6 font-medium text-gray-900">1. Filter by City</h3>
              <p className="mt-2 text-sm text-gray-600">
                Use the <code className="bg-gray-100 px-1.5 rounded">city</code> parameter to filter vendors
                by their city. This is a case-insensitive partial match, so &quot;lagos&quot;, &quot;Lagos&quot;,
                and &quot;LAGOS&quot; all work. You can also use partial names like &quot;iba&quot; for Ibadan.
              </p>
              <CodeBlock
                id="city-filter"
                code={`# Vendors in Ibadan
GET /api/v1/products/rice/prices/?city=ibadan

# Vendors in Lagos
GET /api/v1/search/?q=garri&city=lagos`}
              />

              <h3 className="mt-6 font-medium text-gray-900">2. Geo-Radius Filter</h3>
              <p className="mt-2 text-sm text-gray-600">
                Pass <code className="bg-gray-100 px-1.5 rounded">latitude</code>,{" "}
                <code className="bg-gray-100 px-1.5 rounded">longitude</code>, and{" "}
                <code className="bg-gray-100 px-1.5 rounded">max_distance</code> (in km) to find
                vendors within a radius. The response includes <code className="bg-gray-100 px-1.5 rounded">distance_km</code> showing
                how far each vendor is from your coordinates.
              </p>
              <CodeBlock
                id="geo-filter"
                code={`# Vendors within 15km of University of Ibadan
GET /api/v1/products/rice/prices/?latitude=7.3775&longitude=3.9470&max_distance=15

# Response includes distance
{
  "results": [{
    "price": "4500.00",
    "vendor_location": {
      "city": "Ibadan",
      "state": "Oyo",
      "latitude": 7.3965,
      "longitude": 3.9167
    },
    "distance_km": 4.2
  }]
}`}
              />

              <h3 className="mt-6 font-medium text-gray-900">3. Combined Filters</h3>
              <p className="mt-2 text-sm text-gray-600">
                You can combine city and geo-radius for more specific results.
              </p>
              <CodeBlock
                id="combined-filter"
                code={`# Lagos vendors within 5km of Victoria Island
GET /api/v1/search/?q=bread&city=lagos&latitude=6.4281&longitude=3.4219&max_distance=5`}
              />

              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> If <code>latitude</code>/<code>longitude</code> are provided without
                  <code> max_distance</code>, the <code>distance_km</code> field will still be calculated
                  in the response, but no distance filtering is applied. Only vendors with registered
                  coordinates participate in geo-filtering.
                </p>
              </div>
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

