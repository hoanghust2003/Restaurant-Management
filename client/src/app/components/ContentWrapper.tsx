'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PageTransitionManager, throttle } from '@/app/utils/transitionUtils';

interface LayoutContentProps {
  children: ReactNode;
}

/**
 * ContentWrapper component that prevents entire layout from reloading
 * when navigating between pages with the same layout.
 */
export default function ContentWrapper({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const [content, setContent] = useState(children);
  const prevPathRef = useRef(pathname);
  
  // Set up scroll position saving
  useEffect(() => {
    // Save scroll position when the user scrolls
    const handleScroll = throttle(() => {
      if (!PageTransitionManager.isTransitioning()) {
        PageTransitionManager.saveScrollPosition(pathname);
      }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);
  
  useEffect(() => {
    // Only update the content if the path changes
    if (prevPathRef.current !== pathname) {
      // Save current scroll position before navigating away
      PageTransitionManager.saveScrollPosition(prevPathRef.current);
      
      // Start transition
      PageTransitionManager.startTransition();
      
      // Add a fade animation
      const contentContainer = document.getElementById('content-wrapper');
      if (contentContainer) {
        contentContainer.classList.add('content-fade-out');
        
        // After animation completes, update content and fade back in
        setTimeout(() => {
          setContent(children);
          contentContainer.classList.remove('content-fade-out');
          contentContainer.classList.add('content-fade-in');
          
          // Remove the fade-in class after animation completes
          setTimeout(() => {
            contentContainer.classList.remove('content-fade-in');
            
            // Restore scroll position if navigating back, or scroll to top otherwise
            const isBackNavigation = window.history.state?.navigationType === 'back';
            if (isBackNavigation) {
              PageTransitionManager.restoreScrollPosition(pathname);
            } else {
              window.scrollTo(0, 0);
            }
            
            // End transition
            PageTransitionManager.endTransition();
          }, 300);
        }, 300);
      } else {
        setContent(children);
        // End transition
        PageTransitionManager.endTransition();
      }
      
      // Update the previous path
      prevPathRef.current = pathname;
    }
  }, [pathname, children]);

  return (
    <div 
      id="content-wrapper" 
      className="transition-opacity duration-300 ease-in-out"
    >
      {content}
    </div>
  );
}
