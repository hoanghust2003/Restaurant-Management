'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This component enhances navigation with SPA-like behavior throughout the application.
 * It attaches event listeners to intercept navigation events and prevents full page reloads.
 */
export default function NavigationEnhancer() {
  const router = useRouter();

  useEffect(() => {
    // Handler for all link clicks
    const handleLinkClick = (e: MouseEvent) => {
      // Only process anchor tags
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (!anchor) return;
      
      // Don't intercept if:
      // - Has target="_blank"
      // - Has download attribute
      // - Control/Alt/Shift/Meta keys are pressed
      // - It's an anchor link (#)
      // - It's an external link
      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        e.ctrlKey || 
        e.altKey || 
        e.shiftKey || 
        e.metaKey ||
        anchor.href.startsWith('#') ||
        anchor.href.includes('://') && !anchor.href.includes(window.location.host)
      ) {
        return;
      }
      
      // Get the URL from the href attribute
      const url = anchor.getAttribute('href');
      if (!url) return;
      
      // Prevent default browser navigation
      e.preventDefault();
      
      // Use Next.js router for client-side navigation
      router.push(url);
    };
    
    // Add global event listener for link clicks
    document.addEventListener('click', handleLinkClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [router]);
  
  return null; // This component doesn't render anything
}
