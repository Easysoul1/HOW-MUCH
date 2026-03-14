export type Role = "customer" | "vendor" | "shopper" | "survey" | "integrator" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Location {
  id: string;
  name: string;
  state: string;
  lat?: number;
  lng?: number;
}

export interface Vendor {
  id: string;
  name: string;
  market: string;
  location: Location;
  verified: boolean;
  rating: number;
  phone?: string;
  image?: string;
}

export interface PricePoint {
  date: string;
  price: number;
  location?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  weightOptions?: string[];
  currentPrice: number;
  priceHistory: PricePoint[];
  volatility?: number;
  vendors?: Vendor[];
}

export interface SearchResult {
  product: Product;
  vendor: Vendor;
  price: number;
  distance: number;
  trend: number[];
}

export interface Order {
  id: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed?: string;
  createdAt: string;
}
