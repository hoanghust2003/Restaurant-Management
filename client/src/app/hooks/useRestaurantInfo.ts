import { useState, useEffect, useCallback } from 'react';
import { restaurantService } from '@/app/services/restaurant.service';
import { RestaurantModel } from '@/app/models/restaurant.model';

interface UseRestaurantInfoReturn {
  restaurant: RestaurantModel | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  prefetch: () => void; // Added prefetch function for background updates
}

// Configurable constants
const MAX_RETRIES = 1; // Reduced from 2 to 1 to minimize network requests
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours for localStorage cache
const NETWORK_ERROR_COOLDOWN = 60 * 1000; // 1 minute cooldown between network error retries

/**
 * Custom hook to fetch and manage restaurant information
 * with optimized loading, caching, and retry logic designed for unreliable networks
 */
export const useRestaurantInfo = (): UseRestaurantInfoReturn => {
  const [restaurant, setRestaurant] = useState<RestaurantModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const [lastFailedFetch, setLastFailedFetch] = useState(0);
  
  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem('restaurantInfo');
      const timestamp = localStorage.getItem('restaurantInfoTimestamp');
      
      if (cachedData && timestamp) {
        // Check if cache is less than cache expiry period
        const isRecent = (Date.now() - Number(timestamp)) < CACHE_EXPIRY;
        if (isRecent) {
          setRestaurant(JSON.parse(cachedData));
        }
      }
    } catch (e) {
      console.warn('Could not load from localStorage', e);
    }
  }, []);

  // Enhanced fetch with retry logic and network resilience
  const fetchRestaurantInfo = useCallback(async (forceRefresh = false) => {
    // Prevent too many retries in poor network conditions
    const now = Date.now();
    if (!forceRefresh && lastFailedFetch > 0 && (now - lastFailedFetch) < NETWORK_ERROR_COOLDOWN) {
      console.log('Skipping fetch due to recent network failure, in cooldown period');
      setLoading(false);
      return;
    }
    
    try {
      if (!forceRefresh && restaurant) {
        // Data already loaded, don't fetch again unless forced
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      const data = await restaurantService.getRestaurantInfo(forceRefresh);
      setRestaurant(data);
      setRetries(0); // Reset retries on success
      setLastFailedFetch(0); // Reset cooldown on success
      
      // Cache in localStorage for offline access
      try {
        localStorage.setItem('restaurantInfo', JSON.stringify(data));
        localStorage.setItem('restaurantInfoTimestamp', Date.now().toString());
      } catch (e) {
        console.warn('Could not cache restaurant info to localStorage', e);
      }
    } catch (err) {
      console.error('Error fetching restaurant information:', err);
      setLastFailedFetch(Date.now()); // Mark the time of this failure
      
      // Try to get from localStorage if network request failed
      if (!restaurant) {
        try {
          const cachedData = localStorage.getItem('restaurantInfo');
          const timestamp = localStorage.getItem('restaurantInfoTimestamp');
          
          if (cachedData && timestamp) {
            // Always show cached data if available, but with warning
            setRestaurant(JSON.parse(cachedData));
            setError('Đang hiển thị thông tin đã lưu trong bộ nhớ');
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Could not load from localStorage', e);
        }
      }
      
      // Auto-retry logic with more conservative approach
      if (retries < MAX_RETRIES) {
        const retryDelay = Math.pow(2, retries) * 1000; // Longer backoff (1s, 2s)
        console.log(`Retrying restaurant info fetch in ${retryDelay}ms (attempt ${retries + 1}/${MAX_RETRIES})`);
        
        // If we have restaurant data from localStorage or previous fetch, show it
        // while retrying in the background
        if (restaurant) {
          setLoading(false);
        }
        
        setTimeout(() => {
          setRetries(prev => prev + 1);
          fetchRestaurantInfo(true); // Force refresh on retry
        }, retryDelay);
      } else {
        const errMessage = err instanceof Error ? err.message : 'Không thể tải thông tin nhà hàng';
        setError(errMessage);
        
        // If we have restaurant data from localStorage or previous fetch,
        // show a less intrusive error (just a warning in the UI)
        setLoading(false);
      }
    } finally {
      if (retries >= MAX_RETRIES || !error) {
        setLoading(false);
      }
    }
  }, [restaurant, retries, error, lastFailedFetch]);

  // Prefetch function - silently update in the background with lower priority
  const prefetch = useCallback(() => {
    // Don't prefetch if we had a recent network failure
    if (lastFailedFetch > 0 && (Date.now() - lastFailedFetch) < NETWORK_ERROR_COOLDOWN) {
      return;
    }
    
    // Don't show loading state or error messages
    (async () => {
      try {
        const data = await restaurantService.getRestaurantInfo(true);
        // Only update if data is different
        if (JSON.stringify(data) !== JSON.stringify(restaurant)) {
          setRestaurant(data);
          localStorage.setItem('restaurantInfo', JSON.stringify(data));
          localStorage.setItem('restaurantInfoTimestamp', Date.now().toString());
        }
        setLastFailedFetch(0); // Reset failed fetch counter on success
      } catch (err) {
        console.debug('Background prefetch failed:', err);
        // Don't show errors for prefetch failures
      }
    })();
  }, [restaurant, lastFailedFetch]);

  // Effect to fetch restaurant info on mount
  useEffect(() => {
    fetchRestaurantInfo();
    
    // Set up periodic background refresh every 10 minutes instead of 5
    // to reduce network requests in poor network conditions
    const intervalId = setInterval(() => {
      prefetch();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Manual refetch function that resets retry count
  const refetch = useCallback(async () => {
    setRetries(0);
    setLastFailedFetch(0); // Reset cooldown on manual refresh
    await fetchRestaurantInfo(true);
  }, [fetchRestaurantInfo]);

  return {
    restaurant,
    loading,
    error,
    refetch,
    prefetch
  };
};
