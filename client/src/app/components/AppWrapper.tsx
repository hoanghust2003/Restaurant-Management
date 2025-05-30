'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import NavigationEnhancer from './NavigationEnhancer';
import { PageTransitionManager } from '@/app/utils/transitionUtils';

// Create a context to manage route transitions without full page reload
interface AppWrapperProps {
  children: ReactNode;
}

/**
 * AppWrapper that wraps the entire application to provide SPA-like navigation
 * This component ensures only the content changes when navigating between
 * routes, while keeping the layout intact.
 */
export default function AppWrapper({ children }: AppWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();
  const contentRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);
  useEffect(() => {
    // Save original navigation methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    const handleBeforeNavigate = () => {
      if (!isTransitioningRef.current) {
        isTransitioningRef.current = true;
        
        // Use requestAnimationFrame to avoid insertion effect scheduling updates
        requestAnimationFrame(() => {
          setIsNavigating(true);
          if (contentRef.current) {
            contentRef.current.style.pointerEvents = 'none';
            contentRef.current.style.willChange = 'opacity';
          }
        });
      }
    };
    
    const handleNavigationEnd = () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      navigationTimeoutRef.current = setTimeout(() => {
        isTransitioningRef.current = false;
        setIsNavigating(false);
        
        if (contentRef.current) {
          contentRef.current.style.pointerEvents = 'auto';
          contentRef.current.style.willChange = 'auto';
        }
      }, 300); // Match transition duration
    };
    
    // Override navigation methods
    window.history.pushState = function(...args) {
      handleBeforeNavigate();
      const result = originalPushState.apply(this, args);
      window.dispatchEvent(new Event('locationchange'));
      return result;
    };
    
    window.history.replaceState = function(...args) {
      handleBeforeNavigate();
      const result = originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('locationchange'));
      return result;
    };
    
    // Handle back/forward navigation
    const handlePopState = () => {
      handleBeforeNavigate();
      window.dispatchEvent(new Event('locationchange'));
    };
    
    // Handle all navigation changes
    const handleLocationChange = () => {
      handleNavigationEnd();
    };
    
    window.addEventListener('popstate', handlePopState, { passive: true });
    window.addEventListener('locationchange', handleLocationChange, { passive: true });
    
    return () => {
      // Restore original methods and clean up
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('locationchange', handleLocationChange);
      
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div id="app-wrapper">
      <NavigationEnhancer />
      <div 
        ref={contentRef}
        id="main-content" 
        className={`
          transition-opacity duration-300 ease-in-out transform-gpu
          ${isNavigating ? 'opacity-0' : 'opacity-100'}
        `}
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          willChange: isNavigating ? 'opacity' : 'auto'
        }}
      >
        {children}
      </div>
    </div>
  );
}
