'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import NavigationEnhancer from './NavigationEnhancer';
import { PageTransitionManager } from '@/app/utils/transitionUtils';

// Create a context to manage route transitions without full page reload
interface AppWrapperProps {
  children: ReactNode;
}

/**
 * AppWrapper that wraps the entire application to provide SPA-like navigation
 * This component ensures only the content changes when navigating between
 * routes, while keeping the layout (header, sidebar, etc.) intact.
 */
export default function AppWrapper({ children }: AppWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
    // Listen for navigation events and prevent default behavior
  useEffect(() => {
    // Save the original pushState and replaceState methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    // Override pushState to detect navigation changes
    window.history.pushState = function(...args) {
      // Set navigation type to 'forward' in the state
      if (args[0] && typeof args[0] === 'object') {
        args[0] = { ...args[0], navigationType: 'forward' };
      } else {
        args[0] = { navigationType: 'forward' };
      }
      
      // Call the original method
      const result = originalPushState.apply(this, args);
      
      // Dispatch custom events
      window.dispatchEvent(new Event('pushstate'));
      window.dispatchEvent(new Event('locationchange'));
      
      return result;
    };
    
    // Override replaceState to maintain navigation type
    window.history.replaceState = function(...args) {
      // Preserve the existing navigationType if it exists
      if (window.history.state?.navigationType && args[0] && typeof args[0] === 'object') {
        args[0] = { ...args[0], navigationType: window.history.state.navigationType };
      }
      
      // Call the original method
      const result = originalReplaceState.apply(this, args);
      
      return result;
    };
    
    // Listen for popstate events (back/forward)
    const handlePopState = () => {
      // Set navigation type to 'back' in history state
      const currentState = window.history.state || {};
      window.history.replaceState(
        { ...currentState, navigationType: 'back' },
        ''
      );
      
      window.dispatchEvent(new Event('locationchange'));
    };
      // Listen for our custom locationchange event
    const handleLocationChange = () => {
      setIsNavigating(true);
      PageTransitionManager.startTransition();
      
      // Apply fade-out effect to main content
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.classList.add('content-fade-out');
        
        // After a short delay, remove the effect
        setTimeout(() => {
          mainContent.classList.remove('content-fade-out');
          setIsNavigating(false);
          PageTransitionManager.endTransition();
        }, 300);
      } else {
        setIsNavigating(false);
        PageTransitionManager.endTransition();
      }
    };
    
    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('locationchange', handleLocationChange);
    
    // Clean up on unmount
    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []);
    return (
    <div id="app-wrapper">
      <NavigationEnhancer />
      <div id="main-content" className={`transition-opacity duration-300 ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </div>
  );
}
