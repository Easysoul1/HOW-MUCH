export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  status: "active" | "pending" | "suspended";
  rating: number;
  revenue: number;
  joinedDate: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  previousPrice: number; // For trend analysis
  vendorId: string;
  vendorName: string;
  stock: number;
  category: string;
  imageUrl: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  total_amount?: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  date: string;
  created_at?: string;
  items: number;
}

export const MOCK_VENDORS: Vendor[] = [
  {
    id: "v1",
    name: "Mama Nkechi Provisions",
    category: "Groceries",
    location: "Balogun Market, Lagos",
    status: "active",
    rating: 4.8,
    revenue: 4500000,
    joinedDate: "2024-01-15",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80",
  },
  {
    id: "v2",
    name: "Olu & Sons Electronics",
    category: "Electronics",
    location: "Alaba Int'l, Lagos",
    status: "active",
    rating: 4.5,
    revenue: 12500000,
    joinedDate: "2023-11-20",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80",
  },
  {
    id: "v3",
    name: "Hassan Textiles",
    category: "Fashion",
    location: "Kano City Market",
    status: "pending",
    rating: 0,
    revenue: 0,
    joinedDate: "2026-02-14",
    imageUrl: "https://images.unsplash.com/photo-1604176354204-9268737828fa?auto=format&fit=crop&q=80",
  },
  {
    id: "v4",
    name: "Iya Basira Foodstuff",
    category: "Groceries",
    location: "Bodija, Ibadan",
    status: "suspended",
    rating: 3.2,
    revenue: 120000,
    joinedDate: "2025-05-10",
    imageUrl: "https://images.unsplash.com/photo-1605218427368-35b88c42971d?auto=format&fit=crop&q=80",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Tubers of Yam (Large)",
    price: 4500,
    previousPrice: 3800,
    vendorId: "v1",
    vendorName: "Mama Nkechi Provisions",
    stock: 45,
    category: "Groceries",
    imageUrl: "https://images.unsplash.com/photo-1591873336785-3e284a7e94e4?auto=format&fit=crop&q=80", // Yam placeholder
    updatedAt: "2 hours ago",
  },
  {
    id: "p2",
    name: "Palm Oil (5 Liters)",
    price: 12000,
    previousPrice: 11500,
    vendorId: "v1",
    vendorName: "Mama Nkechi Provisions",
    stock: 12,
    category: "Groceries",
    imageUrl: "https://images.unsplash.com/photo-1621946394348-15d2ce2c5893?auto=format&fit=crop&q=80", // Oil placeholder
    updatedAt: "5 hours ago",
  },
  {
    id: "p3",
    name: "Samsung 4K Smart TV",
    price: 450000,
    previousPrice: 480000,
    vendorId: "v2",
    vendorName: "Olu & Sons Electronics",
    stock: 5,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80",
    updatedAt: "1 day ago",
  },
  {
    id: "p4",
    name: "Local Rice (50kg)",
    price: 68000,
    previousPrice: 65000,
    vendorId: "v4",
    vendorName: "Iya Basira Foodstuff",
    stock: 100,
    category: "Groceries",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80",
    updatedAt: "Just now",
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-7782",
    customerName: "Chinedu Okeke",
    total: 24500,
    status: "processing",
    date: "2026-02-16",
    items: 3,
  },
  {
    id: "ORD-7781",
    customerName: "Amina Yusuf",
    total: 12000,
    status: "delivered",
    date: "2026-02-15",
    items: 1,
  },
  {
    id: "ORD-7780",
    customerName: "Tunde Bakare",
    total: 450000,
    status: "pending",
    date: "2026-02-15",
    items: 1,
  },
];

export const ANALYTICS_DATA = {
  totalRevenue: 45000000,
  activeVendors: 124,
  activeBuyers: 4500,
  pendingApprovals: 8,
  revenueHistory: [
    { name: "Mon", value: 240000 },
    { name: "Tue", value: 139800 },
    { name: "Wed", value: 980000 },
    { name: "Thu", value: 390800 },
    { name: "Fri", value: 480000 },
    { name: "Sat", value: 380000 },
    { name: "Sun", value: 430000 },
  ],
};
