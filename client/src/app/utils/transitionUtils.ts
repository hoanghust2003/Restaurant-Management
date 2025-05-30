'use client';

/**
 * Utility to throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Utility to create and check PageTransitionEvents
 */
export class PageTransitionManager {
  private static scrollPositions: Record<string, number> = {};
  private static activeTransition = false;
  
  /**
   * Save scroll position for the current page
   */
  static saveScrollPosition(path: string): void {
    PageTransitionManager.scrollPositions[path] = window.scrollY;
  }
  
  /**
   * Restore scroll position for a given path
   */
  static restoreScrollPosition(path: string, defaultTo: 'top' | 'maintain' = 'top'): void {
    if (PageTransitionManager.scrollPositions[path] !== undefined) {
      window.scrollTo(0, PageTransitionManager.scrollPositions[path]);
    } else if (defaultTo === 'top') {
      window.scrollTo(0, 0);
    }
  }
  
  /**
   * Mark a transition as active
   */
  static startTransition(): void {
    PageTransitionManager.activeTransition = true;
  }
  
  /**
   * Mark a transition as complete
   */
  static endTransition(): void {
    PageTransitionManager.activeTransition = false;
  }
  
  /**
   * Check if transition is active
   */
  static isTransitioning(): boolean {
    return PageTransitionManager.activeTransition;
  }
}
