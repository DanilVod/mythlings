import { useEffect, useCallback, useRef } from 'react';
import { useGameData } from '@/contexts/GameDataContext';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAME_DATA_CACHE_KEY = '@mythlings:game_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedGameData {
  floors: any[];
  mythlings: any[];
  abilities: any[];
  timestamp: number;
}

/**
 * Custom hook for managing game data synchronization
 * Provides automatic data fetching, caching, and background sync
 */
export function useGameDataSync() {
  const { isAuthenticated } = useAuth();
  const { refreshGameData, syncGameData, floors, mythlings, abilities } =
    useGameData();
  const syncIntervalRef = useRef<number | null>(null);

  /**
   * Load cached game data from AsyncStorage
   */
  const loadCachedData =
    useCallback(async (): Promise<CachedGameData | null> => {
      try {
        const cached = await AsyncStorage.getItem(GAME_DATA_CACHE_KEY);
        if (!cached) return null;

        const data: CachedGameData = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - data.timestamp < CACHE_DURATION) {
          console.log('Using cached game data');
          return data;
        }

        // Cache expired
        console.log('Game data cache expired');
        await AsyncStorage.removeItem(GAME_DATA_CACHE_KEY);
        return null;
      } catch (error) {
        console.error('Error loading cached game data:', error);
        return null;
      }
    }, []);

  /**
   * Save game data to AsyncStorage cache
   */
  const saveCachedData = useCallback(async () => {
    try {
      const data: CachedGameData = {
        floors,
        mythlings,
        abilities,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(GAME_DATA_CACHE_KEY, JSON.stringify(data));
      console.log('Game data cached successfully');
    } catch (error) {
      console.error('Error caching game data:', error);
    }
  }, [floors, mythlings, abilities]);

  /**
   * Initialize game data loading
   * Tries cache first, then fetches from server
   */
  const initializeGameData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // Try to load from cache first
      const cached = await loadCachedData();
      if (cached) {
        // Cache is valid, use it and refresh in background
        console.log('Initializing with cached data');
        // Note: In a real implementation, you'd want to update the context
        // with cached data, then refresh in background
      }

      // Always fetch fresh data from server
      await syncGameData();

      // Cache the fresh data
      await saveCachedData();
    } catch (error) {
      console.error('Error initializing game data:', error);
    }
  }, [isAuthenticated, loadCachedData, syncGameData, saveCachedData]);

  /**
   * Force refresh game data from server
   * Bypasses cache and fetches fresh data
   */
  const forceRefresh = useCallback(async () => {
    if (!isAuthenticated) return;

    console.log('Force refreshing game data');
    await refreshGameData();
    await saveCachedData();
  }, [isAuthenticated, refreshGameData, saveCachedData]);

  /**
   * Clear cached game data
   * Useful for debugging or when you want to force a fresh load
   */
  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(GAME_DATA_CACHE_KEY);
      console.log('Game data cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  /**
   * Start background sync interval
   * Periodically syncs data in the background
   */
  const startBackgroundSync = useCallback(
    (intervalMs: number = 60000) => {
      // Clear existing interval
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }

      // Start new interval
      syncIntervalRef.current = setInterval(async () => {
        if (isAuthenticated) {
          console.log('Background sync triggered');
          await syncGameData();
          await saveCachedData();
        }
      }, intervalMs);

      console.log(`Background sync started (${intervalMs}ms interval)`);
    },
    [isAuthenticated, syncGameData, saveCachedData],
  );

  /**
   * Stop background sync interval
   */
  const stopBackgroundSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
      console.log('Background sync stopped');
    }
  }, []);

  /**
   * Initialize on mount and set up background sync
   */
  useEffect(() => {
    if (isAuthenticated) {
      initializeGameData();
      startBackgroundSync(60000); // Sync every minute
    }

    // Cleanup on unmount
    return () => {
      stopBackgroundSync();
    };
  }, [
    isAuthenticated,
    initializeGameData,
    startBackgroundSync,
    stopBackgroundSync,
  ]);

  return {
    // Data
    floors,
    mythlings,
    abilities,

    // Actions
    refreshGameData: forceRefresh,
    syncGameData,
    clearCache,
    startBackgroundSync,
    stopBackgroundSync,

    // Status
    isInitialized: floors.length > 0 || mythlings.length > 0,
  };
}
