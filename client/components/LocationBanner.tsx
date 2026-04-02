"use client";

import { AlertTriangle, X, MapPin, RefreshCw } from "lucide-react";
import { useLocation } from "@/lib/location";
import { useState } from "react";

export function LocationBanner() {
  const { location, isUsingCached, error, loading, requestLocation } = useLocation();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if dismissed or no issues
  if (dismissed || (!isUsingCached && !error)) {
    return null;
  }

  // Show cached location warning
  if (isUsingCached && location) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800">
              <strong>Using last known location</strong> — Some results may be outdated.{' '}
              <button 
                onClick={requestLocation}
                disabled={loading}
                className="underline hover:no-underline font-medium"
              >
                {loading ? 'Refreshing...' : 'Update location'}
              </button>
            </p>
          </div>
          <button 
            onClick={() => setDismissed(true)}
            className="text-amber-600 hover:text-amber-800 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <MapPin className="w-4 h-4 text-red-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-800">
              <strong>Location unavailable</strong> — {error}{' '}
              <button 
                onClick={requestLocation}
                disabled={loading}
                className="underline hover:no-underline font-medium inline-flex items-center gap-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try again'
                )}
              </button>
            </p>
          </div>
          <button 
            onClick={() => setDismissed(true)}
            className="text-red-600 hover:text-red-800 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
