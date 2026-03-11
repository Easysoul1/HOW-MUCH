# HowMuch Frontend - Copilot Reference

## Project Overview
Next.js 14 frontend for the HowMuch grocery price comparison platform.

## Tech Stack
- **Framework**: Next.js 14.2.18 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom components
- **Theme**: Dark mode with next-themes
- **Fonts**: Inter + Space Grotesk
- **State**: React hooks (can add Zustand/Redux later)
- **API**: Fetch with backend at http://127.0.0.1:8000

## Backend API Integration
**Base URL**: `http://127.0.0.1:8000/api`

### Available Endpoints
- **Authentication**:
  - POST `/users/register/` - Register user
  - POST `/users/login/` - Login (returns JWT tokens)
  - POST `/users/logout/` - Logout
  - POST `/users/token/refresh/` - Refresh access token
  - GET `/users/profile/` - Get profile
  - PUT `/users/profile/` - Update profile

- **Products**:
  - GET `/products/` - List products (search, filter, paginate)
  - GET `/products/{slug}/` - Product detail
  - GET `/products/categories/` - List categories
  - GET `/products/by-category/{slug}/` - Products by category
  - GET `/products/featured/` - Featured products

## Project Structure
```
client/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (buyer)/         # Customer dashboard
│   ├── (vendor)/        # Vendor dashboard
│   ├── (shopper)/       # Personal shopper dashboard
│   ├── (survey)/        # Crowdsourcer dashboard
│   ├── (integrator)/    # API integrator dashboard
│   ├── (admin)/         # Admin dashboard
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── components/
│   ├── ui/             # Shadcn UI components
│   └── providers/      # Context providers (theme, auth)
├── lib/
│   ├── api.ts          # API client functions
│   ├── auth.ts         # Auth utilities
│   ├── constants.ts    # Constants
│   ├── utils.ts        # Utility functions
│   └── hooks.ts        # Custom React hooks
├── types/
│   └── index.ts        # TypeScript types
└── public/             # Static assets
```

## User Types / Roles
1. **customer** - Regular buyers (default)
2. **vendor** - Sellers with storefronts
3. **shopper** - Personal shoppers
4. **survey** - Crowdsourcers (price surveyors)
5. **integrator** - API consumers
6. **admin** - Platform administrators

## Design Theme
- **Color Scheme**: Dark mode primary (can toggle to light)
- **Fonts**: 
  - Inter (body text)
  - Space Grotesk (headings)
- **Components**: Radix UI with Tailwind
- **Style**: Modern, clean, data-focused

## Key Features to Implement
- [x] API client with JWT token management
- [x] Location extraction (browser geolocation API) - **Auto-requests on signup**
- [x] **Reverse geocoding** - Auto-detects city, state, and address from GPS coordinates
- [x] Authentication (login/register) - **Integrated with backend API**
- [x] Product browsing and search
- [x] **Registration page updated with:**
  - Real backend API integration
  - Automatic location request on form load
  - **Reverse geocoding using OpenStreetMap Nominatim**
  - **Auto-fills city, state, and address fields**
  - **Fields become readonly when location detected**
  - Visual feedback for location status (loading/error/success)
  - Proper error handling with detailed messages
- [ ] Price comparison views
- [ ] Shopping cart
- [ ] Order placement
- [ ] Vendor profiles
- [ ] Personal shopper requests
- [ ] Price survey forms
- [ ] Analytics dashboards

## Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## State Management Strategy
- **Auth State**: Context API (AuthProvider)
- **Location State**: Context API (LocationProvider)
- **API Data**: React Query or SWR (future)
- **Local State**: useState/useReducer

## API Integration Pattern
```typescript
// Example API call with auth
const response = await fetch(`${API_URL}/products/`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Location Services

### Browser Geolocation
- Uses `navigator.geolocation.getCurrentPosition()`
- High accuracy enabled (GPS-level precision)
- Stores coordinates in localStorage
- Auto-requests permission on signup page
- **Coordinates rounded to 6 decimal places (11cm accuracy)**

### Reverse Geocoding
- **Service:** OpenStreetMap Nominatim API (free, no API key needed)
- **Endpoint:** https://nominatim.openstreetmap.org/reverse
- **Rate Limit:** 1 request/second (acceptable for signup use case)
- **Returns:** city, state, country, and full display name
- **Fallback chain:** city → town → village → state_district → county
- **User-Agent:** Required header (set to "HowMuch Nigerian Price Comparison")
- **Auto-fills form fields:** City, State, Address
- **Fields become readonly** after auto-detection with visual indicator

### Location Accuracy
- **GPS (mobile):** 5-30 meters in Nigerian cities (most accurate)
- **WiFi (desktop):** 50-200 meters (moderate accuracy)
- **Cell towers:** 200-1000+ meters (least accurate)
- **Best practice:** Use mobile device outside for signup
- **See:** LOCATION_ACCURACY.md for detailed troubleshooting guide

### Usage
```typescript
// Get location with address
const { location, address, requestLocation } = useLocation();

// location = { latitude: 6.524379, longitude: 3.379206 }
// address = {
//   city: "Lagos",
//   state: "Lagos State", 
//   country: "Nigeria",
//   address: "123 Market St, Lagos Island, Lagos State, Nigeria"
// }
```

## Current Status
✅ Base Next.js 14 setup
✅ Dark theme with Tailwind
✅ Multiple user role routes
✅ API client created (`lib/api.ts`)
✅ Auth context provider (`lib/auth.tsx`)
✅ Location context provider (`lib/location.tsx`)
✅ Type definitions aligned with backend
✅ Environment configured (.env.local)
✅ Dependencies installed
✅ Dev server running on http://localhost:3000
✅ Integrated with backend API at http://127.0.0.1:8000/api
✅ **Navbar text visibility fixed** (proper contrast in light/dark modes)
✅ **Sign out functionality working** (all dashboards)
✅ **Dashboard navigation colors improved**

## Both Servers Running
- **Backend**: http://127.0.0.1:8000 (Django + DRF)
- **Frontend**: http://localhost:3000 (Next.js 14)
- **API Docs**: http://127.0.0.1:8000/api/docs/

## Notes
- Auth and Location providers use `.tsx` extension (contain JSX)
- Tokens stored in localStorage
- Location coordinates stored in localStorage
- CORS enabled between frontend and backend

---
**Last Updated**: 2026-02-20
