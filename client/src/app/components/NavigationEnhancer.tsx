'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * This component enhances navigation with SPA-like behavior throughout the application.
 * It attaches event listeners to intercept navigation events and prevents full page reloads.
 */
export default function NavigationEnhancer() {
  const router = useRouter();
  const pathname = usePathname();
  const navigatingRef = useRef(false);
  const lastNavigationTimeRef = useRef(0);

  useEffect(() => {
    const DEBOUNCE_DELAY = 250; // Minimum time between navigations

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (!anchor || navigatingRef.current) return;
      
      // Skip navigation for special cases
      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        e.ctrlKey || 
        e.altKey || 
        e.shiftKey || 
        e.metaKey ||
        anchor.href.startsWith('#') ||
        (anchor.href.includes('://') && !anchor.href.includes(window.location.host)) ||
        anchor.pathname === pathname
      ) {
        return;
      }
      
      const url = anchor.getAttribute('href');
      if (!url) return;

      // Debounce navigation
      const now = Date.now();
      if (now - lastNavigationTimeRef.current < DEBOUNCE_DELAY) {
        e.preventDefault();
        return;
      }
      lastNavigationTimeRef.current = now;
      
      try {
        // Prevent default browser navigation
        e.preventDefault();
        navigatingRef.current = true;

        // Set pointer-events: none on the content wrapper to prevent further clicks
        const contentWrapper = document.getElementById('content-wrapper');
        if (contentWrapper) {
          contentWrapper.style.pointerEvents = 'none';
        }

        // Use Next.js router for client-side navigation
        await router.push(url);
      } catch (error) {
        console.error('Navigation failed:', error);
        // Fallback to traditional navigation on error
        window.location.href = url;
      } finally {
        // Reset navigation state after transition
        setTimeout(() => {
          navigatingRef.current = false;
          const contentWrapper = document.getElementById('content-wrapper');
          if (contentWrapper) {
            contentWrapper.style.pointerEvents = 'auto';
          }
        }, 300); // Match transition duration
      }
    };
    
    // Add capture phase event listener for better control
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [router, pathname]);
  
  return null; // This component doesn't render anything
}
