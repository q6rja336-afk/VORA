'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWatchlist, toggleWatchlist } from '@/lib/supabase';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

interface WatchlistContextType {
  watchlist: string[];
  toggleItem: (id: string) => Promise<void>;
  isInList: (id: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    // Load initial watchlist
    const loadList = async () => {
      // Try DB
      const dbList = await getWatchlist(DEMO_USER_ID);
      if (dbList.length > 0) {
        setWatchlist(dbList);
      } else {
        // Fallback to local storage for demo
        const local = localStorage.getItem('vora_watchlist');
        if (local) setWatchlist(JSON.parse(local));
      }
    };
    loadList();
  }, []);

  const toggleItem = async (id: string) => {
    const isAdded = await toggleWatchlist(DEMO_USER_ID, id);
    
    let newList: string[];
    if (watchlist.includes(id)) {
      newList = watchlist.filter(item => item !== id);
    } else {
      newList = [...watchlist, id];
    }
    
    setWatchlist(newList);
    localStorage.setItem('vora_watchlist', JSON.stringify(newList));
  };

  const isInList = (id: string) => watchlist.includes(id);

  return (
    <WatchlistContext.Provider value={{ watchlist, toggleItem, isInList }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
