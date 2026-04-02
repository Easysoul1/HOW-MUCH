'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from './api';

interface LocationCoords {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

interface LocationAddress {
  city?: string;
  state?: string;
  country?: string;
  address?: string;
}

interface LocationContextType {
  location: LocationCoords | null;
  address: LocationAddress | null;
  loading: boolean;
  error: string | null;
  isUsingCached: boolean;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Reverse geocoding using Nominatim (OpenStreetMap) - Free and no API key needed
async function reverseGeocode(lat: number, lon: number): Promise<LocationAddress> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HowMuch-App', // Required by Nominatim
        },
      }
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();
    const addr = data.address || {};

    return {
      city: addr.city || addr.town || addr.village || addr.state_district || addr.county || '',
      state: addr.state || '',
      country: addr.country || '',
      address: data.display_name || '',
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {};
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [address, setAddress] = useState<LocationAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCached, setIsUsingCached] = useState(false);

  // Update backend with new location
  const updateBackend = useCallback(async (latitude: number, longitude: number) => {
    try {
      await apiClient.patch('/users/me/', { latitude, longitude }, true);
    } catch (err) {
      console.error('Failed to update location in backend:', err);
    }
  }, []);

  useEffect(() => {
    // Load location from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem('user_location');
      const savedAddress = localStorage.getItem('user_address');
      
      if (savedLocation) {
        try {
          const parsed = JSON.parse(savedLocation) as LocationCoords;
          const age = parsed.timestamp ? Date.now() - parsed.timestamp : Infinity;
          
          if (age < CACHE_DURATION) {
            setLocation(parsed);
            setIsUsingCached(false);
          } else {
            // Location is stale
            setLocation(parsed);
            setIsUsingCached(true);
          }
        } catch (err) {
          console.error('Error parsing saved location:', err);
        }
      }
      
      if (savedAddress) {
        try {
          setAddress(JSON.parse(savedAddress));
        } catch (err) {
          console.error('Error parsing saved address:', err);
        }
      }

      // Auto-request fresh location on mount
      requestLocation();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const coords: LocationCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now(),
      };

      setLocation(coords);
      setIsUsingCached(false);
      localStorage.setItem('user_location', JSON.stringify(coords));

      // Reverse geocode to get address
      const addressData = await reverseGeocode(coords.latitude, coords.longitude);
      setAddress(addressData);
      localStorage.setItem('user_address', JSON.stringify(addressData));

      // Update backend
      updateBackend(coords.latitude, coords.longitude);

      setLoading(false);
    } catch (err: any) {
      let errorMessage = 'Failed to get location';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location access.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }

      setError(errorMessage);
      setLoading(false);
      
      // Keep using cached location if available
      if (location) {
        setIsUsingCached(true);
      }
    }
  }, [location, updateBackend]);

  const clearLocation = () => {
    setLocation(null);
    setAddress(null);
    setError(null);
    setIsUsingCached(false);
    localStorage.removeItem('user_location');
    localStorage.removeItem('user_address');
  };

  return (
    <LocationContext.Provider
      value={{ location, address, loading, error, isUsingCached, requestLocation, clearLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
