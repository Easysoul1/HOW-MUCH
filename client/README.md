# HOW MUCH — Frontend

**Know the Real Price. Anywhere in Nigeria.**

Production-ready Next.js 14 frontend for Nigeria's grocery intelligence platform.

## Tech stack

- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS** (design system: primary #0B3D2E, accent #00D084, amber #F59E0B)
- **shadcn-style UI** (Radix primitives + CVA)
- **Framer Motion** (animations)
- **Recharts** (analytics)
- **Lucide** icons
- **next-themes** (light/dark)

## Design

- **Typography:** Inter (UI), Space Grotesk (numbers/display)
- **Marketing:** Light mode default
- **Dashboards:** Dark mode (vendor, shopper, survey, integrator, admin, customer dashboard)
- **8pt grid,** 20px radius, glass panels, soft glow accents

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes (41 interfaces)

| # | Route | Description |
|---|--------|-------------|
| 1 | `/` | Landing (hero, live search, ticker, trust metrics, CTA) |
| 2 | `/search` | Search results (filters, verified badge, distance, mini trend) |
| 3 | `/item/[id]` | Item detail (heatmap, charts, vendor comparison, logistics) |
| 4 | `/suggestive-buy` | Suggestive buy engine (savings comparison) |
| 5 | `/ai-shopping-list` | AI shopping list (multi-item, breakdown) |
| 6 | `/price-history` | Price history & analytics (charts, export CSV) |
| 7 | `/vendors` | Vendor directory |
| 8 | `/vendors/[id]` | Vendor storefront |
| 9 | `/personal-shopper` | Personal shopper overview |
| 10 | `/about` | About (mission, methodology, verification) |
| 11 | `/pricing` | Pricing & API tiers |
| 12 | `/blog` | Blog & market reports |
| 13 | `/contact` | Contact form |
| 14 | `/login` | Login |
| 15 | `/signup` | Signup |
| 16 | `/forgot-password` | Forgot password |
| 17 | `/dashboard` | Customer dashboard overview |
| 18 | `/dashboard/saved-items` | Saved items |
| 19 | `/dashboard/saved-searches` | Saved searches |
| 20 | `/dashboard/orders` | Orders |
| 21 | `/dashboard/notifications` | Notifications |
| 22 | `/dashboard/settings` | Settings |
| 23 | `/vendor` | Vendor application |
| 24 | `/vendor/dashboard` | Vendor dashboard |
| 25 | `/vendor/products` | Product management |
| 26 | `/vendor/analytics` | Vendor analytics |
| 27 | `/shopper` | Shopper application |
| 28 | `/shopper/dashboard` | Shopper dashboard |
| 29 | `/shopper/requests` | Active requests |
| 30 | `/shopper/earnings` | Earnings |
| 31 | `/survey/submit` | Survey submission (location, price, reward preview) |
| 32 | `/survey/dashboard` | Survey dashboard |
| 33 | `/survey/rewards` | Reward tracker |
| 34 | `/integrator/docs` | API documentation |
| 35 | `/integrator/keys` | API keys |
| 36 | `/integrator/analytics` | Usage analytics |
| 37 | `/admin` | Admin dashboard |
| 38 | `/admin/vendor-verification` | Vendor verification queue |
| 39 | `/admin/survey-validation` | Survey validation |
| 40 | `/admin/fraud` | Fraud monitoring heatmap |
| 41 | `/admin/social` | Social media auto generator |

## Folder structure

```
app/
  (marketing)/     # Light, public pages
  (auth)/          # Login, signup, forgot password
  (dashboard)/     # Customer dashboard (dark)
  (vendor)/        # Vendor app (dark)
  (shopper)/       # Personal shopper (dark)
  (survey)/        # Crowdsourcing (dark)
  (integrator)/    # API docs & keys (dark)
  (admin)/         # Admin (dark)
components/
  ui/              # Primitives (Button, Card, Input, Badge, etc.)
  layout/          # Marketing header/footer, dashboard sidebar
  data/            # Verified badge, etc.
  charts/          # PriceChart, MiniTrend
  analytics/       # AnimatedCounter
  search/          # LiveSearchBar
  forms/           # SearchForm
lib/
  utils.ts
  constants.ts
types/
  index.ts
```

## Role-based routing

Middleware in `middleware.ts` is prepared for auth checks. Uncomment to protect dashboard routes and redirect to `/login` when unauthenticated.

## Build

```bash
npm run build
npm start
```

---

Built for scalability and future Africa expansion. Data and auth are mocked; connect to your backend when ready.
