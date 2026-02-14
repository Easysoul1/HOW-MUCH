/**
 * Curated Unsplash image URLs for HOW MUCH.
 * All support product narrative: Nigerian markets, groceries, data, logistics.
 * Use with next/image; hostname images.unsplash.com is allowed in next.config.
 */
const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

export const IMAGES = {
  // Landing: hero overlay (market / food environment)
  heroMarket: U("1488459716781-31db52582fe9", 1920), // groceries/food
  // Markets: Mile 12 Lagos, Bodija Ibadan style
  marketMile12: U("1488459716781-31db52582fe9", 800), // groceries/food
  marketBodija: U("1542838132-92c53300491e", 800), // vegetables
  marketGeneral: U("1488459716781-31db52582fe9", 800), // groceries
  // Image grid: real grocery markets
  grid1: U("1542838132-92c53300491e", 600),
  grid2: U("1488459716781-31db52582fe9", 600),
  grid3: U("1542838132-92c53300491e", 800),
  grid4: U("1488459716781-31db52582fe9", 600),
  // Analytics preview: abstract data dashboard
  analyticsDashboard: U("1551288049-bebda4e38f71", 1200),
  // Search: vendor storefront thumbnail, market area
  vendorStorefront: U("1555396273-367ea4eb4db5", 400), // store
  marketArea: U("1488459716781-31db52582fe9", 400), // groceries
  // Item detail: grocery item, packaging
  riceProduct: U("1586204771384-34cd7e0a330f", 600), // rice/grain
  beansProduct: U("1488459716781-31db52582fe9", 600), // food
  // Suggestive buy: route/map, logistics
  routeMap: U("1569336416362-efaf8f715d7", 800),
  logistics: U("1601584115197-04ecc0da31d7", 800), // delivery
  // Vendor storefront: banner, store
  vendorBanner: U("1555396273-367ea4eb4db5", 1200),
  storeInterior: U("1555396273-367ea4eb4db5", 800),
  // Personal shopper: shopper in market, delivery
  shopperMarket: U("1488459716781-31db52582fe9", 800),
  delivery: U("1601584115197-04ecc0da31d7", 800),
  // Crowdsourcing: market survey, smartphone
  marketSurvey: U("1557804506-669a67965ba0", 800), // person with device
  smartphoneCapture: U("1512941937669-90a1b58e7e9c", 600),
  // Blog: featured (consistent aspect 16/10)
  blogFeatured1: U("1551288049-bebda4e38f71", 800),
  blogFeatured2: U("1488459716781-31db52582fe9", 800),
  blogFeatured3: U("1542838132-92c53300491e", 800),
} as const;
