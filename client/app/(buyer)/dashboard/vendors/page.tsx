"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Store, MapPin, Search, Filter, BadgeCheck, AlertTriangle, Map, List as ListIcon, Navigation } from "lucide-react";
import { useLocation } from "@/lib/location";
import apiClient from "@/lib/api";

interface Vendor {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  city: string;
  state: string;
  address: string;
  latitude: string;
  longitude: string;
  is_verified: boolean;
  created_at: string;
  business_name: string;
  years_in_business: number | null;
  products_sold: string | null;
  store_image_url: string | null;
  verification_status: string;
  distance_km: number | null;
}

export default function VendorsPage() {
  const { location } = useLocation();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Filters
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [radiusKm, setRadiusKm] = useState<number | null>(null);

  useEffect(() => {
    fetchVendors();
  }, [location, verifiedOnly, selectedState, selectedCity, radiusKm]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (location?.latitude && location?.longitude) {
        params.lat = location.latitude;
        params.lng = location.longitude;
      }
      
      if (verifiedOnly) params.verified = 'true';
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;
      if (radiusKm) params.radius = radiusKm;

      const query = new URLSearchParams(params).toString();
      const data = await apiClient.get(`/vendors/${query ? `?${query}` : ''}`, true);
      const results = (data as { results?: Vendor[] }).results ?? (data as Vendor[]);
      setVendors(results);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      v.business_name?.toLowerCase().includes(search) ||
      v.city?.toLowerCase().includes(search) ||
      v.state?.toLowerCase().includes(search) ||
      v.products_sold?.toLowerCase().includes(search)
    );
  });

  // Extract unique states and cities for filters
  const states = Array.from(new Set(vendors.map(v => v.state).filter(Boolean))).sort();
  const cities = Array.from(new Set(vendors.map(v => v.city).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nearby Vendors</h1>
        <p className="mt-1 text-gray-500">Browse verified vendors and their inventory near you</p>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors, locations, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2.5 transition-colors ${
                viewMode === "list" ? 'bg-green-50 text-green-700' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2.5 border-l border-gray-200 transition-colors ${
                viewMode === "map" ? 'bg-green-50 text-green-700' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification Status</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">Verified only</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Radius</label>
              <select
                value={radiusKm ?? ""}
                onChange={(e) => setRadiusKm(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">Any distance</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="20">Within 20 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={() => {
              setVerifiedOnly(false);
              setSelectedState("");
              setSelectedCity("");
              setRadiusKm(null);
            }}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredVendors.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">No vendors found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery || verifiedOnly || selectedState || selectedCity || radiusKm
              ? "Try adjusting your filters"
              : "No vendors available in your area yet"}
          </p>
        </div>
      )}

      {/* Vendors List View */}
      {!loading && viewMode === "list" && filteredVendors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.map(vendor => (
            <Link
              key={vendor.id}
              href={`/dashboard/vendors/${vendor.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Store Image */}
                {vendor.store_image_url ? (
                  <img src={vendor.store_image_url} alt={vendor.business_name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{vendor.business_name}</h3>
                    {vendor.is_verified ? (
                      <span title="Verified Vendor"><BadgeCheck className="w-4 h-4 text-green-600 shrink-0" /></span>
                    ) : (
                      <span title="Unverified Vendor"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /></span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{vendor.city}, {vendor.state}</span>
                  </div>
                  
                  {vendor.products_sold && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{vendor.products_sold}</p>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs">
                    {vendor.distance_km !== null && (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Navigation className="w-3 h-3" />
                        {vendor.distance_km < 1 
                          ? `${Math.round(vendor.distance_km * 1000)}m away` 
                          : `${vendor.distance_km}km away`}
                      </span>
                    )}
                    {vendor.years_in_business && (
                      <span className="text-gray-400">{vendor.years_in_business}+ years</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Map View */}
      {!loading && viewMode === "map" && filteredVendors.length > 0 && (
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 text-center">
          <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Map view coming soon</p>
          <p className="text-sm text-gray-400 mt-1">
            We're working on integrating an interactive map to show vendor locations.
          </p>
          <button
            onClick={() => setViewMode("list")}
            className="mt-4 text-sm text-green-600 hover:text-green-700 underline"
          >
            Switch to list view
          </button>
        </div>
      )}
    </div>
  );
}
