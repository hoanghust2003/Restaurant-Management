'use client';

import { useEffect, useRef } from 'react';

/**
 * A hook to monitor component rendering performance
 * @param componentName The name of the component being monitored
 * @param dependencies The dependencies array to watch for changes
 * @param logThreshold Optional threshold in ms to log (default is 10ms)
 */
export const usePerformanceMonitor = (
  componentName: string,
  dependencies: any[],
  logThreshold: number = 10
) => {
  // Store render times to calculate duration
  const renderTime = useRef<number>(performance.now());
  
  // Store previous dependencies to compare changes
  const prevDeps = useRef<any[]>(dependencies);
  
  useEffect(() => {
    // Calculate render duration
    const endTime = performance.now();
    const duration = endTime - renderTime.current;

    // Find which dependency changed (if any)
    const changedDeps: string[] = [];
    
    if (prevDeps.current) {
      dependencies.forEach((dep, index) => {
        if (dep !== prevDeps.current[index]) {
          changedDeps.push(`dependency[${index}]`);
        }
      });
    }
    
    // Log performance if it exceeds the threshold
    if (duration > logThreshold) {
      console.log(
        `[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms` +
        (changedDeps.length ? ` due to changes in: ${changedDeps.join(', ')}` : '')
      );
    }
    
    // Store current values for next comparison
    prevDeps.current = [...dependencies];
    renderTime.current = performance.now();
    
    return () => {
      // Log unmount time if needed
      const unmountTime = performance.now() - renderTime.current;
      if (unmountTime > logThreshold) {
        console.log(`[Performance] ${componentName} unmounted in ${unmountTime.toFixed(2)}ms`);
      }
    };
  }, [...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
};
