"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { savedItemsApi } from "./api";

interface SavedItemsContextValue {
  savedIds: Set<number>;
  isLoading: boolean;
  isSaved: (listingId: number) => boolean;
  toggle: (listingId: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const SavedItemsContext = createContext<SavedItemsContextValue | null>(null);

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await savedItemsApi.getIds();
      const ids = (data as { listing_ids: number[] }).listing_ids || [];
      setSavedIds(new Set(ids));
    } catch {
      // Not logged in or error - clear saved items
      setSavedIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load saved IDs on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      refresh();
    } else {
      setIsLoading(false);
    }
  }, [refresh]);

  const isSaved = useCallback((listingId: number) => {
    return savedIds.has(listingId);
  }, [savedIds]);

  const toggle = useCallback(async (listingId: number): Promise<boolean> => {
    try {
      const result = await savedItemsApi.toggle(listingId);
      const { saved } = result as { saved: boolean; id: number | null };
      
      setSavedIds(prev => {
        const next = new Set(prev);
        if (saved) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });
      
      return saved;
    } catch (error) {
      console.error('Failed to toggle saved item:', error);
      throw error;
    }
  }, []);

  return (
    <SavedItemsContext.Provider value={{
      savedIds,
      isLoading,
      isSaved,
      toggle,
      refresh,
    }}>
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems() {
  const ctx = useContext(SavedItemsContext);
  if (!ctx) throw new Error("useSavedItems must be used within SavedItemsProvider");
  return ctx;
}
