import { useEffect, useRef } from 'react';

/**
 * Hook to measure component performance
 * @param componentName - Name of the component to monitor
 * @param dependencies - Array of dependencies that should trigger performance measurement
 * @param threshold - Minimum time in ms to log as a slow render (default: 100ms)
 */
export function usePerformanceMonitor(
  componentName: string,
  dependencies: any[] = [],
  threshold: number = 100
): void {
  // Keep track of render start time
  const renderStartTime = useRef<number>(performance.now());
  
  // Store last render duration for debugging
  const lastRenderTime = useRef<number | null>(null);

  useEffect(() => {
    // Measure initial render time
    const initialRenderTime = performance.now() - renderStartTime.current;
    lastRenderTime.current = initialRenderTime;

    if (initialRenderTime > threshold) {
      console.warn(`[Performance] ${componentName} initial render: ${initialRenderTime.toFixed(2)}ms (above ${threshold}ms threshold)`);
    }
    
    // Reset start time for next render
    renderStartTime.current = performance.now();
    
    return () => {
      // Measure update render time on cleanup
      const updateRenderTime = performance.now() - renderStartTime.current;
      lastRenderTime.current = updateRenderTime;
      
      if (updateRenderTime > threshold) {
        console.warn(`[Performance] ${componentName} re-render: ${updateRenderTime.toFixed(2)}ms (above ${threshold}ms threshold)`);
      }
    };
  }, dependencies);
}

/**
 * Utility function to measure execution time of any function
 * @param fn Function to measure
 * @param fnName Name of the function (for logging)
 * @returns The result of the function call
 */
export function measurePerformance<T>(fn: () => T, fnName: string): T {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  if (totalTime > 50) { // Log if function takes more than 50ms
    console.warn(`[Performance] Function ${fnName} took ${totalTime.toFixed(2)}ms`);
  }
  
  return result;
}
