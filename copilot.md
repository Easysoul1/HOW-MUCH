# HowMuch — Copilot Context

> Nigerian grocery price comparison platform. Vendors list prices, buyers compare across vendors.
> Read this file at the start of every session to understand the full project state.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Django 5 + Django REST Framework, SQLite (local dev), Cloudinary (media) |
| Frontend | Next.js 15 (App Router, TypeScript), Tailwind CSS, shadcn/ui |
| Auth | JWT (SimpleJWT) — stored in localStorage as `access_token` / `refresh_token` |
| Dev run | Backend: `cd backend && python3 manage.py runserver` on `:8000` |
| Dev run | Frontend: `cd client && npm run dev` on `:3000` |
| Docker | Single-image deployment: nginx on 80 → Django (:8000) + Next.js (:3000) |

---

## Project Structure

```
HOWMUCH/
├── backend/
│   ├── config/          — settings, urls, wsgi
│   └── apps/
│       ├── users/       — custom User model, auth, profiles
│       ├── products/    — product catalog, categories, sizes, units, size requests
│       ├── pricing/     — vendor listings, price history
│       ├── vendors/     — vendor app (mostly placeholder)
│       └── ... (orders, search, analytics, integrations, etc.)
├── client/
│   ├── app/
│   │   ├── (admin)/admin/       — admin portal pages
│   │   ├── (vendor)/vendor/     — vendor portal pages
│   │   ├── (buyer)/dashboard/   — buyer dashboard pages
│   │   ├── (auth)/              — login, signup, forgot-password
│   │   └── (marketing)/        — public-facing pages
│   ├── lib/api.ts               — ALL API calls centralised here
│   └── components/              — shadcn/ui + custom components
├── docker/
│   ├── nginx.conf
│   └── entrypoint.sh
└── Dockerfile                   — single-container build
```

---

## User Types

| Type | Value | Portal |
|---|---|---|
| Customer/Buyer | `CUSTOMER` | `/dashboard/` |
| Vendor | `VENDOR` | `/vendor/` |
| Admin | `ADMIN` | `/admin/` |
| Personal Shopper | `SHOPPER` | `/shopper/` |
| Crowdsourcer | `CROWDSOURCER` | `/survey/` |

- `ADMIN` **cannot** register via API — must be created via Django admin or shell
- Registration accepts only `CUSTOMER` and `VENDOR`
- Login accepts email OR username
- `user_type` is read-only after creation (no PATCH to change it)

---

## Backend Models

### `apps/users` — User
```
User (extends AbstractUser)
  username, email, first_name, last_name
  user_type: CUSTOMER | VENDOR | ADMIN | SHOPPER | CROWDSOURCER
  phone_number, address, city, state
  latitude, longitude (decimal, from geolocation)
  created_at
```

### `apps/products` — Product Catalog
```
Category          — name, slug, parent (subcategories), is_active
UnitOfMeasurement — name, abbreviation (kg, L, tuber, basket, etc.)
ProductSize       — value + unit FK → auto label e.g. "5kg", "1tuber"
                    unique_together: [value, unit]
Product           — name, slug (auto), sku (auto HM-XXXXXXXX), description
                    category FK, available_sizes M2M → ProductSize
                    image (Cloudinary), status: PENDING|APPROVED|REJECTED
                    suggested_by FK (null = admin created), reviewed_by FK
                    is_active, is_featured
ProductImage      — product FK, image, alt_text, is_primary
SizeRequest       — product FK, requested_by FK, value, unit FK
                    note, status: PENDING|APPROVED|REJECTED
                    unique_together: [product, value, unit, requested_by]
                    On approve → creates ProductSize + links to product
```

### `apps/pricing` — Vendor Listings
```
VendorListing   — vendor FK (VENDOR users only), product FK (APPROVED only)
                  size FK → ProductSize, brand (optional, e.g. "Gino")
                  price (Decimal), is_available (bool), notes (text)
                  created_at, updated_at (auto_now)
                  NO unique_together — same product+size can have multiple brands
                  save() override: records PriceHistory when price changes

PriceHistory    — listing FK, price, recorded_at (auto_now_add, immutable)
                  Used for price trend % and ML/graph data
```

---

## Key API Endpoints

### Auth — `/api/users/`
```
POST /api/users/register/          — signup (CUSTOMER or VENDOR)
POST /api/users/login/             — returns access + refresh tokens
POST /api/users/token/refresh/     — refresh access token
GET  /api/users/me/                — current user profile
PATCH /api/users/me/               — update profile (email/phone read-only in UI)
```

### Products — `/api/products/`
```
GET    /api/products/              — list all (paginated)
GET    /api/products/{slug}/       — detail with available_sizes[]
POST   /api/products/              — vendor suggests / admin creates
PATCH  /api/products/{slug}/       — admin update
POST   /api/products/{slug}/approve/        — admin approve
POST   /api/products/{slug}/reject/         — admin reject {reason}
GET    /api/products/pending/               — admin: list pending suggestions
GET    /api/products/my_suggestions/        — vendor: own suggestions
POST   /api/products/{slug}/suggest_size/   — vendor: suggest new size
GET    /api/products/size-requests/?status=PENDING   — admin: list size requests
POST   /api/products/size-requests/{id}/approve/     — admin: approve (creates size)
POST   /api/products/size-requests/{id}/reject/      — admin: reject

GET  /api/products/categories/     — all categories
GET  /api/products/units/          — all units
POST /api/products/units/          — create unit (any auth user allowed)
GET  /api/products/sizes/          — all sizes (filterable by ?unit=)
POST /api/products/sizes/          — admin creates size
```

### Pricing — `/api/pricing/`
```
GET    /api/pricing/listings/              — vendor: own listings
POST   /api/pricing/listings/             — vendor: create listing
PATCH  /api/pricing/listings/{id}/        — vendor: update (triggers price history)
DELETE /api/pricing/listings/{id}/        — vendor: delete

GET    /api/pricing/public/               — public: all available listings
GET    /api/pricing/public/?product_slug=rice     — filter by product
GET    /api/pricing/public/?search=gino+tomatoes  — free text (searches product name + brand + notes)
GET    /api/pricing/public/?ordering=price        — sort (price, -price, updated_at)
GET    /api/pricing/public/?lat=6.5&lng=3.4       — annotate distance_km from buyer
GET    /api/pricing/public/?lat=6.5&lng=3.4&radius=10  — filter within 10km radius

GET    /api/pricing/history/              — all price history (ML/graphs)
GET    /api/pricing/history/?product_slug=rice    — for specific product
GET    /api/pricing/history/?listing_id=42        — for specific listing
GET    /api/pricing/history/?include_current=1    — also includes current prices as data points
```

---

## Frontend API Client (`client/lib/api.ts`)

All API methods use `apiClient` which auto-parses JSON and **throws on non-2xx**.
**Never call `.json()` on results** — data is already parsed.
Paginated responses: check `.results ?? data` pattern.

```typescript
authApi          — register, login, logout, me, updateProfile
productsApi      — list, get(slug), create, update, delete, approve, reject, pending
vendorProductsApi — mySuggestions, suggest(FormData), suggestSize(slug, {product, value, unit, note})
adminProductsApi — list, get, create, update, delete, approve, reject, pending
sizeRequestsApi  — list(status?), approve(id), reject(id, reason)
categoriesApi    — list, root
unitsApi         — list, create({name, abbreviation})
sizesApi         — list, create
listingsApi      — list, create, update(id), delete(id)    [vendor own listings]
publicListingsApi — search({search, product_slug, size, ordering})  [buyer]
priceHistoryApi  — get({product_slug, listing_id, include_current, ordering})
```

---

## Frontend Pages — What's Built & Working

### Admin Portal (`/admin/`)
| Page | Status | Notes |
|---|---|---|
| `/admin/` | ✅ Dashboard | Stats overview |
| `/admin/products` | ✅ Full CRUD | Dark theme, edit modal, inline size search, custom size creation (POSTs to `/products/sizes/`) |
| `/admin/approvals` | ✅ Live data | 4 tabs: Product Suggestions, Size Requests, KYC (placeholder), Vendor Registration (placeholder) |
| `/admin/vendors` | Placeholder | |
| `/admin/buyers` | Placeholder | |
| `/admin/analytics` | Placeholder | |

### Vendor Portal (`/vendor/`)
| Page | Status | Notes |
|---|---|---|
| `/vendor/` | ✅ Dashboard | |
| `/vendor/products` | ✅ Full | Grid of all platform products, click → detail modal (image/description/sizes/SKU), "Suggest a Size" sub-form (with new unit creation), "Suggest Product" modal |
| `/vendor/inventory` | ✅ Full | CRUD table, inline availability toggle, "Xh ago" hints, add/edit modal with product search dropdown (sizes auto-filtered to selected product's sizes), filters: size/price/availability/updated |

### Buyer Dashboard (`/dashboard/`)
| Page | Status | Notes |
|---|---|---|
| `/dashboard/` | ✅ Built | Hero search bar → free-text search or autocomplete product select. Cards show: price, vendor, brand, size, % trend, vendor location + distance, "Compare" button. Filters: vendor, price range, size, distance radius, sort. Distance filter uses browser geolocation + Haversine API. Compare view: full-screen overlay with multi-line price history graph (SVG), add more items picker, side-by-side comparison table. |
| `/dashboard/profile` | ✅ | Email/phone read-only, "Get Location" button triggers geolocation → auto-fills address fields |

---

## Design System / Theming

### Unified Light Theme (all portals)
```
Page bg:       bg-gray-50
Card/panel bg: bg-white
Input bg:      bg-gray-50 with border-gray-200
Borders:       border-gray-200
Text primary:  text-gray-900
Text secondary: text-gray-500
Text muted:    text-gray-400

Active nav:    bg-green-50 text-green-700 border-green-200
Accent:        bg-green-600 hover:bg-green-700 text-white
Status badges:
  - Approved:  bg-green-50 text-green-700
  - Pending:   bg-yellow-50 text-yellow-700
  - Rejected:  bg-red-50 text-red-600
Sign out:      text-red-600 hover:bg-red-50
Notification:  bg-red-500 dot (2px)
```

### Mobile-First Approach
- **No dark theme** — removed all `dark:` prefixed classes and `.dark` CSS vars
- `defaultTheme` set to `"light"` in root layout, `enableSystem` disabled
- All portals use the same green accent light theme
- Headers: `h-14 sm:h-16` for better mobile density
- Sidebar touch targets: `py-3` (48px min)
- Content padding: `p-4 sm:p-6 lg:p-10`
- Responsive text: `text-2xl sm:text-3xl` for page headings
- Mobile nav: Sheet drawer with full navigation

---

## Important Implementation Details

### Product → Size Flow
- `ProductSize.label` auto-generated as `{value}{unit.abbreviation}` (strips trailing zeros)
- Admin product modal has inline custom size creator: POST to `/products/sizes/` → auto-checks new size
- Vendor inventory modal: selecting a product triggers `productsApi.get(slug)` to load `available_sizes` → size dropdown shows ONLY that product's sizes
- Vendor can suggest new sizes per product via `SizeRequest` → admin approves in Approvals page → size linked to product

### Price History
- Tracked automatically in `VendorListing.save()` — if price changes, old price saved to `PriceHistory`
- `PublicListingSerializer.price_change_pct` — % change from last history entry to current price
- `GET /api/pricing/history/?include_current=1` — returns full dataset for ML/graphs

### Search (Buyer Dashboard)
- Two modes:
  1. Autocomplete: user selects from product suggestions → fetches listings by `product_slug`
  2. Free-text: press Enter or click Search → hits `?search=query` on listings (searches `product__name`, `brand`, `notes`)

### Vendor Location & Distance
- `PublicListingSerializer` includes `vendor_city`, `vendor_state`, `vendor_latitude`, `vendor_longitude`, `distance_km`
- Distance computed server-side via Haversine formula (Python `math` — no PostGIS needed) when `?lat=&lng=` query params are provided
- `?radius=` filters to vendors within that km radius; vendors without coordinates are excluded when radius is set
- Frontend shows vendor city/state on listing cards, and "Xkm away" badge when buyer shares location
- Distance filter: buyer clicks "Enable location" → browser geolocation → distance dropdown (5/10/25/50/100km) triggers re-fetch

### Price History Sparkline
- Removed from listing cards — price history now shown in Compare View only
- Compare View renders a multi-line SVG chart (320×140px viewBox, responsive width)
- Each compared listing gets its own colored line (6 color palette)
- Y-axis shows ₦ labels, X-axis is time-based
- Fetches `priceHistoryApi.get({ listing_id, include_current: true })` per item
- No external charting library — pure inline SVG `<path>`

### Compare View
- User clicks "Compare" on listing cards → items added to comparison cart
- Floating bar at bottom shows count + "Compare" button to open full-screen view
- Compare view includes:
  1. **Multi-line price history graph** — overlaid lines for all selected items
  2. **Add another listing** — horizontal picker of remaining listings from search results
  3. **Side-by-side comparison table** — product, price, size, brand, trend, location, distance, updated
- Table is horizontally scrollable with sticky first column for mobile
- Items can be removed individually from comparison

### Unit Creation
- Any authenticated user can create units via `POST /api/products/units/`
- Vendor size suggestion form has a toggle "Unit not listed? Add a new one" → creates the unit first, uses its ID for the size request

### Auth/Signup
- Username field removed from signup — email sent as username
- Login placeholder: "username/email"

### Profile
- Email and phone number fields are **read-only** in the profile UI
- "Get Location" button in address section triggers browser geolocation → auto-fills address/city/state fields

### Admin Approval Badge
- AdminSidebar + MobileAdminNav fetch real pending count on mount
- Uses `adminProductsApi.pending()` + `sizeRequestsApi.list("PENDING")` → sum of both
- Badge only shows if count > 0

### Docker
- Single image: 2-stage build (node:20-alpine builds Next.js, python:3.12-slim runs everything)
- nginx on 80: `/api/*` → gunicorn:8000, `/*` → Next.js node:3000
- `output: 'standalone'` in `next.config.mjs`
- Database path: env var `DATABASE_PATH` (default `db.sqlite3`)

---

## Seed Data (Current DB)

**Products:** Rice, Beans, Tomatoes, Yam (all APPROVED)

**Categories:** Beverages, Cooking Essentials, Fruits, Grains & Cereals, Proteins, Tubers, Vegetables

**Units:** bag, basket, derica, g, kg, L, mL, mudu, pc, tuber, CG

**Sizes & Product Assignments:**
- Rice → 1bag, 1derica, 2derica, 5kg, 10kg, 25kg, 50kg
- Beans → 1bag, 1derica, 2derica, 5kg, 10kg, 25kg, 50kg
- Tomatoes → 1basket, 1derica, 2derica
- Yam → 1tuber, 5tuber, 10tuber

---

## Pending / Next Steps

1. **Admin approvals** — KYC and Vendor Registration tabs are placeholders
2. **Vendor dashboard** — stats are mock data, not connected to real backend counts
3. **VendorProfile model** — `apps/vendors` is mostly empty; `vendor_name` in listings falls back to email prefix. A proper `VendorProfile` with `business_name`, `location`, `logo` would improve the buyer experience
4. **Buyer saved items / saved searches** — pages exist but are placeholder/mock

---

## Coding Preferences

- **Minimal changes** — surgical edits, never rewrite working code unnecessarily
- **No `.json()` calls** on API responses — `apiClient` auto-parses
- **Paginated pattern**: `(data as { results?: T[] }).results ?? (data as T[])`
- **Unified light theme** — all portals use white/gray-50 bg, green-600 accents, gray-200 borders
- **No dark: classes** — dark theme has been fully removed; do NOT add `dark:` prefixed classes
- Status badges: `bg-green-50 text-green-700` pattern (NOT bg-green-500/15 text-green-400)
- Do NOT add new dependencies unless necessary — prefer built-in or already-installed packages
- `timeAgo()` — custom relative time helper already in vendor inventory page and buyer dashboard (no external lib)
- Mobile-first: always use responsive padding (`p-4 sm:p-6 lg:p-10`), responsive text (`text-2xl sm:text-3xl`)
- Touch targets: minimum `py-3` (48px) for nav items, `py-2.5` for form inputs
