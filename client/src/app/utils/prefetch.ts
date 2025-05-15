/**
 * Data prefetching utilities to improve application responsiveness
 * This module handles prefetching commonly accessed data to
 * make transitions between pages feel more responsive
 */

import axios from './axios';

// Map to track routes that are currently being prefetched to avoid duplicate requests
const prefetchingRoutes = new Map<string, Promise<any>>();

/**
 * Prefetch common data that will likely be needed soon
 * @param paths Array of API paths to prefetch
 */
export function prefetchCriticalData(paths: string[]): void {
  if (typeof window === 'undefined') return; // Only run on client

  // Only prefetch once React is idle
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      prefetchPaths(paths);
    }, { timeout: 2000 });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => prefetchPaths(paths), 100);
  }
}

/**
 * Prefetch data from multiple paths
 */
async function prefetchPaths(paths: string[]): Promise<void> {
  for (const path of paths) {
    if (!prefetchingRoutes.has(path)) {
      // Track this prefetch to prevent duplicate requests
      const promise = prefetchPath(path);
      prefetchingRoutes.set(path, promise);
      
      try {
        await promise;
      } catch (error) {
        // Silent fail for prefetch operations
        console.debug(`Prefetch failed for ${path}:`, error);
      } finally {
        // Remove from tracking after complete (success or failure)
        prefetchingRoutes.delete(path);
      }
    }
  }
}

/**
 * Prefetch a single API path
 */
async function prefetchPath(path: string): Promise<void> {
  try {
    // Use a low priority request that won't block other requests
    await axios.get(path, {
      headers: {
        'X-Prefetch': 'true', // Add a header so the server knows this is a prefetch
        Priority: 'low'       // HTTP Priority header (supported in some browsers)
      },
      // Longer timeout for prefetch requests since they're lower priority
      timeout: 10000
    });
    console.debug(`Prefetched: ${path}`);
  } catch (error) {
    throw error;
  }
}

/**
 * Prefetch data that will likely be needed on the waiter dashboard
 */
export function prefetchWaiterDashboardData(): void {
  prefetchCriticalData([
    '/tables',
    '/orders?status=pending',
    '/orders?status=in_progress'
  ]);
}

/**
 * Prefetch data that will likely be needed on the kitchen dashboard
 */
export function prefetchKitchenDashboardData(): void {
  prefetchCriticalData([
    '/orders?status=pending',
    '/orders?status=in_progress'
  ]);
}
